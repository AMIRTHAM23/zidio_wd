import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ScatterChart, 
  Scatter,
  ResponsiveContainer 
} from 'recharts';
import { Download, Save, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useData } from '@/contexts/DataContext';
import { ChartConfig } from '@/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface ChartDataPoint {
  id: number;
  name: string;
  value: number;
  x: number;
  y: number;
}

export const ChartGenerator: React.FC = () => {
  const { excelFiles, addChart } = useData();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [error, setError] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);

  const selectedFileData = excelFiles.find(file => file.id === selectedFile);

  const generateChart = () => {
    if (!selectedFileData || !xAxis || !yAxis) {
      setError('Please select a file and both X and Y axes');
      return;
    }

    setError('');

    try {
      const xIndex = selectedFileData.headers.indexOf(xAxis);
      const yIndex = selectedFileData.headers.indexOf(yAxis);

      if (xIndex === -1 || yIndex === -1) {
        setError('Selected columns not found in data');
        return;
      }

      const processedData = selectedFileData.data
        .filter(row => row[xIndex] !== undefined && row[yIndex] !== undefined)
        .slice(0, 50) // Limit to 50 rows for performance
        .map((row, index) => ({
          id: index,
          name: String(row[xIndex]),
          value: parseFloat(String(row[yIndex])) || 0,
          x: parseFloat(String(row[xIndex])) || index,
          y: parseFloat(String(row[yIndex])) || 0
        }));

      setChartData(processedData);
    } catch (err) {
      setError('Error processing data. Please check your file format.');
      console.error('Chart generation error:', err);
    }
  };

  const saveChart = () => {
    if (!chartData.length || !chartTitle) {
      setError('Please generate a chart and provide a title before saving');
      return;
    }

    const chartConfig: ChartConfig = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: chartType,
      title: chartTitle,
      xAxis,
      yAxis,
      dataId: selectedFile,
      createdAt: new Date().toISOString()
    };

    addChart(chartConfig);
    setError('');
    alert('Chart saved successfully!');
  };

  const downloadChart = async (format: 'png' | 'pdf') => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${chartTitle || 'chart'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else if (format === 'pdf') {
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`${chartTitle || 'chart'}.pdf`);
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('Error downloading chart. Please try again.');
    }
  };

  const renderChart = () => {
    if (!chartData.length) return null;

    const commonProps = {
      width: 800,
      height: 400,
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData.slice(0, 10)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              <CartesianGrid />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Data Points" data={chartData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chart Generator</CardTitle>
          <CardDescription>
            Create interactive charts from your uploaded Excel data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file-select">Select Data File</Label>
              <Select value={selectedFile} onValueChange={setSelectedFile}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an Excel file" />
                </SelectTrigger>
                <SelectContent>
                  {excelFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.fileName} ({file.rowCount} rows)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chart-type">Chart Type</Label>
              <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'pie' | 'scatter') => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="x-axis">X-Axis Column</Label>
              <Select value={xAxis} onValueChange={setXAxis} disabled={!selectedFileData}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X-axis column" />
                </SelectTrigger>
                <SelectContent>
                  {selectedFileData?.headers.map((header, index) => (
                    <SelectItem key={index} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="y-axis">Y-Axis Column</Label>
              <Select value={yAxis} onValueChange={setYAxis} disabled={!selectedFileData}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y-axis column" />
                </SelectTrigger>
                <SelectContent>
                  {selectedFileData?.headers.map((header, index) => (
                    <SelectItem key={index} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chart-title">Chart Title</Label>
            <Input
              id="chart-title"
              placeholder="Enter chart title"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={generateChart} disabled={!selectedFile}>
              Generate Chart
            </Button>
            <Button variant="outline" onClick={saveChart} disabled={!chartData.length}>
              <Save className="mr-2 h-4 w-4" />
              Save Chart
            </Button>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{chartTitle || 'Generated Chart'}</CardTitle>
                <CardDescription>
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart showing {xAxis} vs {yAxis}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadChart('png')}>
                  <Download className="mr-2 h-4 w-4" />
                  PNG
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadChart('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={chartRef} className="w-full">
              {renderChart()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};