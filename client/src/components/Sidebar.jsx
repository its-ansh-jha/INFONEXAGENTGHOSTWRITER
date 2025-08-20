import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const Sidebar = ({ 
  projects, 
  selectedProject, 
  selectedSession, 
  onProjectSelect, 
  onSessionSelect, 
  isOpen, 
  onClose 
}) => {
  return (
    <aside className={`
      fixed md:relative top-0 left-0 h-full w-80 bg-vscode-surface border-r border-vscode-border
      transform transition-transform duration-300 ease-in-out z-30
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="p-4 border-b border-vscode-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-vscode-text">Claude Code UI</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="md:hidden text-vscode-text"
          >
            ×
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-vscode-text-muted mb-2">Projects</h3>
            {projects.length === 0 ? (
              <p className="text-sm text-vscode-text-muted">No projects found</p>
            ) : (
              <div className="space-y-2">
                {projects.map((project, index) => (
                  <div
                    key={project.name || index}
                    className={`
                      p-2 rounded cursor-pointer transition-colors
                      ${selectedProject?.name === project.name 
                        ? 'bg-vscode-primary text-white' 
                        : 'hover:bg-vscode-hover text-vscode-text'
                      }
                    `}
                    onClick={() => onProjectSelect(project)}
                  >
                    <div className="text-sm font-medium">
                      {project.displayName || project.name}
                    </div>
                    {project.sessions && project.sessions.length > 0 && (
                      <div className="text-xs text-vscode-text-muted mt-1">
                        {project.sessions.length} session{project.sessions.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedProject && selectedProject.sessions && (
            <div>
              <h3 className="text-sm font-medium text-vscode-text-muted mb-2">Sessions</h3>
              <div className="space-y-1">
                {selectedProject.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      p-2 rounded cursor-pointer text-sm transition-colors
                      ${selectedSession?.id === session.id 
                        ? 'bg-vscode-primary text-white' 
                        : 'hover:bg-vscode-hover text-vscode-text'
                      }
                    `}
                    onClick={() => onSessionSelect(session)}
                  >
                    {session.title || session.id}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;