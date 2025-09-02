import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '@/contexts/DataContext';
import { ExcelData } from '@/types';

export const FileUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addExcelFile } = useData();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );

    if (excelFiles.length === 0) {
      setUploadStatus('error');
      setErrorMessage('Please select valid Excel files (.xlsx, .xls, .csv)');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadProgress(0);

    try {
      for (let i = 0; i < excelFiles.length; i++) {
        const file = excelFiles[i];
        await processFile(file);
        setUploadProgress(((i + 1) / excelFiles.length) * 100);
      }
      
      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 3000);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Error processing files. Please try again.');
      console.error('File processing error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as (string | number)[][];
          
          const excelData: ExcelData = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            fileName: file.name,
            uploadDate: new Date().toISOString(),
            data: rows,
            headers: headers || [],
            rowCount: rows.length
          };
          
          addExcelFile(excelData);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Excel Files
          </CardTitle>
          <CardDescription>
            Upload your Excel files (.xlsx, .xls, .csv) to start analyzing data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Drag and drop your Excel files here
            </p>
            <p className="text-muted-foreground mb-4">
              or click to browse files
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {uploadStatus === 'success' && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Files uploaded successfully! You can now view them in your dashboard.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};