import React from 'react';
import { Button } from '@/components/ui/button';

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
                {selectedProject ? selectedProject.displayName || selectedProject.name : 'Select a Project'}
              </h1>
              {selectedSession && (
                <p className="text-sm text-vscode-text-muted">
                  Session: {selectedSession.title || selectedSession.id}
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
      <div className="flex-1 p-6">
        {!selectedProject ? (
          <div className="text-center text-vscode-text-muted">
            <h2 className="text-xl mb-2">Welcome to Claude Code UI</h2>
            <p>Select a project from the sidebar to get started.</p>
          </div>
        ) : activeTab === 'chat' ? (
          <div className="bg-vscode-surface rounded-lg p-6 h-full">
            <h3 className="text-lg font-semibold text-vscode-text mb-4">Chat Interface</h3>
            {selectedSession ? (
              <div className="text-vscode-text">
                <p>Chat session: {selectedSession.title || selectedSession.id}</p>
                <p className="text-sm text-vscode-text-muted mt-2">
                  Chat functionality will be implemented here.
                </p>
              </div>
            ) : (
              <div className="text-vscode-text-muted">
                Select a session or start a new conversation.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-vscode-surface rounded-lg p-6 h-full">
            <h3 className="text-lg font-semibold text-vscode-text mb-4">Project Files</h3>
            <div className="text-vscode-text-muted">
              File explorer will be implemented here.
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;