import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import DashboardPage from './Dashboard';
import { BarChart3, TrendingUp, FileSpreadsheet, Download } from 'lucide-react';

export default function IndexPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  if (user) {
    return <DashboardPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-6">
                <BarChart3 className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Excel Analytics Platform</h1>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Transform Your Excel Data into 
                <span className="text-primary"> Powerful Insights</span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Upload, analyze, and visualize your Excel data with our comprehensive analytics platform. 
                Create stunning charts, generate reports, and make data-driven decisions.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <FileSpreadsheet className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Excel File Upload</h3>
                  <p className="text-gray-600 text-sm">Support for .xlsx, .xls, and .csv files</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Interactive Charts</h3>
                  <p className="text-gray-600 text-sm">Bar, line, pie, and scatter plots</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Data Analysis</h3>
                  <p className="text-gray-600 text-sm">Dynamic X/Y axis mapping</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Download className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Export Charts</h3>
                  <p className="text-gray-600 text-sm">Download as PNG or PDF</p>
                </div>
              </div>
            </div>

            {/* Demo credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Demo Credentials</h4>
              <p className="text-blue-700 text-sm">
                <strong>Email:</strong> admin@excel.com<br />
                <strong>Password:</strong> admin123
              </p>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="flex justify-center">
            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}