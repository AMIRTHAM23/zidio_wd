import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  BarChart3, 
  TrendingUp, 
  Users,
  Trash2,
  Eye
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { excelFiles, charts, deleteExcelFile } = useData();
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Files',
      value: excelFiles.length,
      icon: FileSpreadsheet,
      color: 'text-blue-600'
    },
    {
      title: 'Total Charts',
      value: charts.length,
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      title: 'Total Records',
      value: excelFiles.reduce((sum, file) => sum + file.rowCount, 0),
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'User Role',
      value: user?.role?.toUpperCase() || 'USER',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your Excel analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Files */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
          <CardDescription>
            Your recently uploaded Excel files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {excelFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No files uploaded yet</p>
              <p className="text-muted-foreground mb-4">
                Start by uploading your first Excel file
              </p>
              <Button onClick={() => onTabChange('upload')}>
                Upload Files
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {excelFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{file.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.rowCount} rows • Uploaded {format(new Date(file.uploadDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {file.headers.length} columns
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTabChange('analytics')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Analyze
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
              {excelFiles.length > 5 && (
                <div className="text-center">
                  <Button variant="link" onClick={() => onTabChange('history')}>
                    View all files ({excelFiles.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Charts</CardTitle>
          <CardDescription>
            Your recently created visualizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {charts.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No charts created yet</p>
              <p className="text-muted-foreground mb-4">
                Create your first chart from uploaded data
              </p>
              <Button 
                onClick={() => onTabChange('analytics')}
                disabled={excelFiles.length === 0}
              >
                Create Chart
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {charts.slice(0, 6).map((chart) => (
                <Card key={chart.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{chart.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {chart.type.toUpperCase()} • {format(new Date(chart.createdAt), 'MMM dd')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{chart.type}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTabChange('analytics')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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