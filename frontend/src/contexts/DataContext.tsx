import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExcelData, ChartConfig } from '@/types';

interface DataContextType {
  excelFiles: ExcelData[];
  charts: ChartConfig[];
  addExcelFile: (file: ExcelData) => void;
  addChart: (chart: ChartConfig) => void;
  deleteExcelFile: (id: string) => void;
  deleteChart: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [excelFiles, setExcelFiles] = useState<ExcelData[]>([]);
  const [charts, setCharts] = useState<ChartConfig[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const savedFiles = localStorage.getItem('excelFiles');
    const savedCharts = localStorage.getItem('charts');
    
    if (savedFiles) {
      setExcelFiles(JSON.parse(savedFiles));
    }
    
    if (savedCharts) {
      setCharts(JSON.parse(savedCharts));
    }
  }, []);

  const addExcelFile = (file: ExcelData) => {
    const updatedFiles = [...excelFiles, file];
    setExcelFiles(updatedFiles);
    localStorage.setItem('excelFiles', JSON.stringify(updatedFiles));
  };

  const addChart = (chart: ChartConfig) => {
    const updatedCharts = [...charts, chart];
    setCharts(updatedCharts);
    localStorage.setItem('charts', JSON.stringify(updatedCharts));
  };

  const deleteExcelFile = (id: string) => {
    const updatedFiles = excelFiles.filter(file => file.id !== id);
    setExcelFiles(updatedFiles);
    localStorage.setItem('excelFiles', JSON.stringify(updatedFiles));
    
    // Also delete associated charts
    const updatedCharts = charts.filter(chart => chart.dataId !== id);
    setCharts(updatedCharts);
    localStorage.setItem('charts', JSON.stringify(updatedCharts));
  };

  const deleteChart = (id: string) => {
    const updatedCharts = charts.filter(chart => chart.id !== id);
    setCharts(updatedCharts);
    localStorage.setItem('charts', JSON.stringify(updatedCharts));
  };

  const value: DataContextType = {
    excelFiles,
    charts,
    addExcelFile,
    addChart,
    deleteExcelFile,
    deleteChart
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};