const mongoose = require('mongoose');

const excelFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  headers: [{
    type: String,
    required: true
  }],
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'File data is required']
  },
  rowCount: {
    type: Number,
    required: [true, 'Row count is required'],
    min: 0
  },
  columnCount: {
    type: Number,
    required: [true, 'Column count is required'],
    min: 0
  },
  processingStatus: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  processingError: {
    type: String
  },
  metadata: {
    sheetNames: [String],
    hasHeaders: {
      type: Boolean,
      default: true
    },
    dataTypes: {
      type: Map,
      of: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
excelFileSchema.index({ uploadedBy: 1, createdAt: -1 });
excelFileSchema.index({ processingStatus: 1 });
excelFileSchema.index({ isActive: 1 });

// Virtual for file URL
excelFileSchema.virtual('fileUrl').get(function() {
  return `/uploads/${this.fileName}`;
});

// Ensure virtual fields are serialized
excelFileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ExcelFile', excelFileSchema);