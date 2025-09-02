import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard as DashboardComponent } from '@/components/dashboard/Dashboard';
import { FileUpload } from '@/components/upload/FileUpload';
import { ChartGenerator } from '@/components/charts/ChartGenerator';
import { HistoryView } from '@/components/history/HistoryView';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardComponent onTabChange={setActiveTab} />;
      case 'upload':
        return <FileUpload />;
      case 'analytics':
        return <ChartGenerator />;
      case 'history':
        return <HistoryView />;
      case 'users':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <p className="text-muted-foreground">User management features coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <DashboardComponent onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}