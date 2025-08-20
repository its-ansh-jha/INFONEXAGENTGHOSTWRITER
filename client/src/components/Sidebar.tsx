import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, RefreshCw, Search } from 'lucide-react';
import FileTree from './FileTree';
import SessionHistory from './SessionHistory';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function Sidebar({ isOpen, onClose, className = '' }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarClasses = `
    ${className}
    fixed md:relative z-40 md:z-auto w-80 md:w-64 lg:w-72 
    bg-vscode-surface border-r border-vscode-border flex flex-col h-full
    transition-transform duration-300 ease-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
          data-testid="overlay-sidebar"
        />
      )}
      
      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="p-3 border-b border-vscode-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-vscode-text">Projects</h3>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-vscode-text-muted hover:text-white hover:bg-vscode-bg"
                data-testid="button-create-project"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-vscode-text-muted hover:text-white hover:bg-vscode-bg"
                data-testid="button-refresh-projects"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vscode-bg border-vscode-border text-vscode-text placeholder:text-vscode-text-muted focus:border-vscode-primary pr-8"
              data-testid="input-search-files"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-vscode-text-muted" />
          </div>
        </div>
        
        {/* File Tree */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <FileTree searchQuery={searchQuery} />
          </ScrollArea>
        </div>
        
        {/* Session History */}
        <SessionHistory />
      </div>
    </>
  );
}
