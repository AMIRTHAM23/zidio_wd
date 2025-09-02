const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const ExcelFile = require('../models/ExcelFile');
const Chart = require('../models/Chart');
const { protect, ownerOrAdmin } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @desc    Upload Excel files
// @route   POST /api/files/upload
// @access  Private
router.post('/upload', protect, upload.array('files', 5), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Process Excel file
        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          errors.push(`${file.originalname}: File is empty`);
          continue;
        }

        const headers = jsonData[0] || [];
        const data = jsonData.slice(1);

        // Create file record
        const excelFile = await ExcelFile.create({
          fileName: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: req.user._id,
          headers: headers.map(h => String(h)),
          data: data,
          rowCount: data.length,
          columnCount: headers.length,
          processingStatus: 'completed',
          metadata: {
            sheetNames: workbook.SheetNames,
            hasHeaders: true,
            dataTypes: detectDataTypes(headers, data)
          }
        });

        uploadedFiles.push(excelFile);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        errors.push(`${file.originalname}: ${error.message}`);
        
        // Clean up file on error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
});

// Helper function to detect data types
function detectDataTypes(headers, data) {
  const types = new Map();
  
  headers.forEach((header, index) => {
    const sample = data.slice(0, 10).map(row => row[index]).filter(val => val !== undefined && val !== null);
    
    if (sample.length === 0) {
      types.set(header, 'unknown');
      return;
    }

    const numericCount = sample.filter(val => !isNaN(Number(val))).length;
    const dateCount = sample.filter(val => !isNaN(Date.parse(val))).length;
    
    if (numericCount / sample.length > 0.8) {
      types.set(header, 'number');
    } else if (dateCount / sample.length > 0.8) {
      types.set(header, 'date');
    } else {
      types.set(header, 'text');
    }
  });

  return types;
}

// @desc    Get user's files
// @route   GET /api/files
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { 
      uploadedBy: req.user._id,
      isActive: true 
    };

    if (req.query.search) {
      query.$or = [
        { originalName: { $regex: req.query.search, $options: 'i' } },
        { fileName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const files = await ExcelFile.find(query)
      .select('-data') // Exclude large data field for list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name email');

    const totalFiles = await ExcelFile.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        files,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalFiles / limit),
          totalFiles,
          hasNext: page < Math.ceil(totalFiles / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting files'
    });
  }
});

// @desc    Get single file with data
// @route   GET /api/files/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && file.uploadedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        file
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting file'
    });
  }
});

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete associated charts
    await Chart.deleteMany({ 'dataSource.fileId': file._id });

    // Delete physical file
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Delete database record
    await ExcelFile.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting file'
    });
  }
});

// @desc    Get file data preview
// @route   GET /api/files/:id/preview
// @access  Private
router.get('/:id/preview', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const file = await ExcelFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Return limited data for preview
    const previewData = {
      headers: file.headers,
      data: file.data.slice(0, limit),
      totalRows: file.rowCount,
      previewRows: Math.min(limit, file.rowCount)
    };

    res.status(200).json({
      success: true,
      data: previewData
    });
  } catch (error) {
    console.error('Get file preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting file preview'
    });
  }
});

// @desc    Get file statistics
// @route   GET /api/files/stats
// @access  Private
router.get('/user/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalFiles = await ExcelFile.countDocuments({ 
      uploadedBy: userId, 
      isActive: true 
    });

    const totalSize = await ExcelFile.aggregate([
      { $match: { uploadedBy: userId, isActive: true } },
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
    ]);

    const totalRows = await ExcelFile.aggregate([
      { $match: { uploadedBy: userId, isActive: true } },
      { $group: { _id: null, totalRows: { $sum: '$rowCount' } } }
    ]);

    const recentFiles = await ExcelFile.countDocuments({
      uploadedBy: userId,
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        totalFiles,
        totalSize: totalSize[0]?.totalSize || 0,
        totalRows: totalRows[0]?.totalRows || 0,
        recentFiles
      }
    });
  } catch (error) {
    console.error('Get file stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting file statistics'
    });
  }
});

module.exports = router;