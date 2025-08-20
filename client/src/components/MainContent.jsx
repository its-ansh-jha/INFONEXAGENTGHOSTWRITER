import React from 'react';
import { Button } from '@/components/ui/button';
import ChatInterface from './ChatInterface';
import FileManager from './FileManager';
import PreviewPane from './PreviewPane';
import Chat from './Chat';
import QuickSettingsPanel from './QuickSettingsPanel';
import { FileCode } from 'lucide-react';

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
                {selectedProject ? selectedProject.displayName || selectedProject.name : 'AI Code Assistant'}
              </h1>
              {selectedProject && (
                <p className="text-sm text-vscode-text-muted">
                  Ready to code with AI assistance
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
            <Button
              variant={activeTab === 'preview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('preview')}
              className="text-sm"
            >
              Preview
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {!selectedProject ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-vscode-text-muted max-w-md">
              <h2 className="text-xl mb-4">Welcome to AI Code Assistant</h2>
              <p className="mb-4">Create a new project or select an existing one to start coding with AI assistance.</p>
              <div className="text-sm">
                <p className="mb-2">AI Features:</p>
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
        ) : activeTab === 'files' ? (
          <div className="flex-1 bg-vscode-surface">
            <FileManager selectedProject={selectedProject} />
          </div>
        ) : activeTab === 'preview' ? (
          <div className="flex-1 bg-vscode-surface">
            <PreviewPane selectedProject={selectedProject} />
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default MainContent;