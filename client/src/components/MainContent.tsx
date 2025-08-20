import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileCode, Terminal, X } from 'lucide-react';
import Chat from './Chat';

interface Tab {
  id: string;
  title: string;
  type: 'chat' | 'file' | 'terminal';
  icon: React.ReactNode;
  filePath?: string;
  isClosable?: boolean;
}

const defaultTabs: Tab[] = [
  {
    id: 'chat',
    title: 'Chat',
    type: 'chat',
    icon: <MessageSquare className="h-4 w-4" />,
    isClosable: false,
  },
];

export default function MainContent() {
  const [tabs, setTabs] = useState<Tab[]>(defaultTabs);
  const [activeTab, setActiveTab] = useState('chat');

  const closeTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.isClosable) return;

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    // If closing active tab, switch to the first remaining tab
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const addFileTab = (fileName: string, filePath: string) => {
    const existingTab = tabs.find(t => t.filePath === filePath);
    
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    const newTab: Tab = {
      id: `file-${Date.now()}`,
      title: fileName,
      type: 'file',
      icon: <FileCode className="h-4 w-4" />,
      filePath,
      isClosable: true,
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const addTerminalTab = () => {
    const existingTerminal = tabs.find(t => t.type === 'terminal');
    
    if (existingTerminal) {
      setActiveTab(existingTerminal.id);
      return;
    }

    const newTab: Tab = {
      id: 'terminal',
      title: 'Terminal',
      type: 'terminal',
      icon: <Terminal className="h-4 w-4" />,
      isClosable: true,
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const renderTabContent = () => {
    const tab = tabs.find(t => t.id === activeTab);
    
    if (!tab) {
      return <div className="flex-1 flex items-center justify-center text-vscode-text-muted">No tab selected</div>;
    }

    switch (tab.type) {
      case 'chat':
        return <Chat />;
      case 'file':
        return (
          <div className="flex-1 flex items-center justify-center text-vscode-text-muted">
            <div className="text-center">
              <FileCode className="h-12 w-12 mx-auto mb-4 text-vscode-text-muted" />
              <p>File editor for {tab.title}</p>
              <p className="text-sm">Coming soon...</p>
            </div>
          </div>
        );
      case 'terminal':
        return (
          <div className="flex-1 flex items-center justify-center text-vscode-text-muted">
            <div className="text-center">
              <Terminal className="h-12 w-12 mx-auto mb-4 text-vscode-text-muted" />
              <p>Terminal interface</p>
              <p className="text-sm">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-vscode-bg">
      {/* Tab Bar */}
      <div className="bg-vscode-surface border-b border-vscode-border flex items-center px-2 h-10 overflow-x-auto">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center space-x-2 px-4 py-2 text-sm cursor-pointer rounded-t ${
                activeTab === tab.id
                  ? 'bg-vscode-bg border-t-2 border-vscode-primary text-vscode-text'
                  : 'text-vscode-text-muted hover:text-vscode-text hover:bg-vscode-bg/50'
              }`}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
            >
              {tab.icon}
              <span>{tab.title}</span>
              {tab.isClosable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1 hover:text-vscode-error"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  data-testid={`button-close-tab-${tab.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
