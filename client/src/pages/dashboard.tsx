import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import TopNavigation from '@/components/TopNavigation';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import SettingsModal from '@/components/SettingsModal';
import { Button } from '@/components/ui/button';
import { Plus, Terminal } from 'lucide-react';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vscode-bg flex items-center justify-center">
        <div className="text-vscode-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-vscode-bg flex items-center justify-center">
        <div className="text-vscode-text">Please log in to continue.</div>
      </div>
    );
  }

  return (
    <div className="bg-vscode-bg text-vscode-text font-sans h-screen overflow-hidden">
      <TopNavigation
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
        isConnected={true}
      />
      
      <div className="flex h-[calc(100vh-3rem)]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <MainContent />
        
        {/* Mobile Floating Actions */}
        <div className="md:hidden fixed bottom-4 right-4 flex flex-col space-y-2 z-40">
          <Button
            size="icon"
            className="w-12 h-12 bg-vscode-primary rounded-full shadow-lg text-white hover:bg-vscode-primary/90"
            data-testid="button-new-chat"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="w-12 h-12 bg-vscode-surface border-vscode-border rounded-full shadow-lg text-vscode-text hover:bg-vscode-bg"
            data-testid="button-open-terminal-mobile"
          >
            <Terminal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
