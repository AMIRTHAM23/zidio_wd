import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  BarChart3, 
  Trash2, 
  Eye,
  Calendar,
  Database
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";

export const HistoryView: React.FC = () => {
  const { excelFiles, charts, deleteExcelFile, deleteChart } = useData();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">History</h2>
        <p className="text-muted-foreground">
          View and manage all your uploaded files and created charts
        </p>
      </div>

      {/* Files Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Uploaded Files ({excelFiles.length})
          </CardTitle>
          <CardDescription>
            All your uploaded Excel files with details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {excelFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No files uploaded</p>
              <p className="text-muted-foreground">Upload your first Excel file to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {excelFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">{file.fileName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(file.uploadDate), 'MMM dd, yyyy HH:mm')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {file.rowCount} rows, {file.headers.length} columns
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {file.headers.length} cols
                    </Badge>
                    <Badge variant="outline">
                      {file.rowCount} rows
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/files/${file.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteExcelFile(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Created Charts ({charts.length})
          </CardTitle>
          <CardDescription>
            All your generated charts and visualizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {charts.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No charts created</p>
              <p className="text-muted-foreground">Create your first chart from uploaded data</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {charts.map((chart) => (
                <Card key={chart.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{chart.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {format(new Date(chart.createdAt), 'MMM dd, yyyy HH:mm')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{chart.type}</Badge>
                        <Badge variant="secondary">{chart.xAxis} vs {chart.yAxis}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/charts/${chart.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteChart(chart.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
