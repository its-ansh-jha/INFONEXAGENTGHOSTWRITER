import React from 'react';
import { Button } from '@/components/ui/button';
import ChatInterface from './ChatInterface';

const MainContent = ({ 
  selectedProject, 
  selectedSession, 
  activeTab, 
  setActiveTab, 
  onToggleSidebar 
}) => {
  return (
    <main className="flex-1 flex flex-col bg-vscode-bg">
      {/* Header */}
      <header className="bg-vscode-surface border-b border-vscode-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onToggleSidebar}
              className="md:hidden text-vscode-text"
            >
              ☰
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-vscode-text">
                {selectedProject ? selectedProject.displayName || selectedProject.name : 'GPT-5 Code UI'}
              </h1>
              {selectedProject && (
                <p className="text-sm text-vscode-text-muted">
                  Ready to code with GPT-5 assistance
                </p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('chat')}
              className="text-sm"
            >
              Chat
            </Button>
            <Button
              variant={activeTab === 'files' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('files')}
              className="text-sm"
            >
              Files
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {!selectedProject ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-vscode-text-muted max-w-md">
              <h2 className="text-xl mb-4">Welcome to GPT-5 Code UI</h2>
              <p className="mb-4">Create a new project or select an existing one to start coding with GPT-5.</p>
              <div className="text-sm">
                <p className="mb-2">GPT-5 Features:</p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Advanced code generation and analysis</li>
                  <li>Real-time debugging assistance</li>
                  <li>Project architecture guidance</li>
                  <li>Best practices recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        ) : activeTab === 'chat' ? (
          <div className="flex-1 bg-vscode-surface">
            <ChatInterface 
              selectedProject={selectedProject}
              selectedSession={selectedSession}
            />
          </div>
        ) : (
          <div className="flex-1 p-6">
            <div className="bg-vscode-surface rounded-lg p-6 h-full">
              <h3 className="text-lg font-semibold text-vscode-text mb-4">Project Files</h3>
              <div className="text-vscode-text-muted">
                File explorer will be implemented here.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;