import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, HelpCircle, Menu, Code } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface TopNavigationProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  isConnected?: boolean;
}

export default function TopNavigation({ 
  onToggleSidebar, 
  onOpenSettings, 
  isConnected = true 
}: TopNavigationProps) {
  const { logout } = useAuth();

  return (
    <nav className="bg-vscode-surface border-b border-vscode-border h-12 flex items-center justify-between px-4 z-50">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-vscode-text hover:text-white hover:bg-vscode-bg"
          onClick={onToggleSidebar}
          data-testid="button-toggle-sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-vscode-primary rounded-lg flex items-center justify-center">
            <Code className="text-white text-sm" />
          </div>
          <span className="font-semibold text-sm text-vscode-text">Claude Code UI</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-1 bg-vscode-bg rounded-md px-2 py-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-vscode-success' : 'bg-vscode-error'}`} />
          <span className="text-xs text-vscode-text-muted" data-testid="text-connection-status">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-vscode-text-muted hover:text-white hover:bg-vscode-bg"
          onClick={onOpenSettings}
          data-testid="button-open-settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-vscode-text-muted hover:text-white hover:bg-vscode-bg"
          onClick={() => window.open('https://github.com/siteboon/claudecodeui', '_blank')}
          data-testid="button-show-help"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-vscode-text-muted hover:text-white hover:bg-vscode-bg"
          onClick={logout}
          data-testid="button-logout"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
