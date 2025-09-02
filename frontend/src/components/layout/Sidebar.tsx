import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Upload, 
  BarChart3, 
  History,
  Settings,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Files', icon: Upload },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
  ];

  const adminItems = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 border-r bg-muted/10 h-[calc(100vh-4rem)]">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                activeTab === item.id && 'bg-primary text-primary-foreground'
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
          
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="text-sm font-medium text-muted-foreground px-2">
                  Admin Tools
                </h3>
              </div>
              {adminItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    activeTab === item.id && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </>
          )}
        </nav>
      </div>
    </div>
  );
};