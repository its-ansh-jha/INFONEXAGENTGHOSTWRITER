
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { FolderOpen, Plus } from 'lucide-react';

function Sidebar({ 
  projects = [], 
  selectedProject, 
  selectedSession, 
  onProjectSelect, 
  onSessionSelect, 
  onNewProject,
  fetchProjects 
}) {
  const handleNewProject = () => {
    // For now, create a simple sample project
    const newProject = {
      id: `project-${Date.now()}`,
      name: `project-${Date.now()}`,
      displayName: `New Project ${Date.now()}`,
      path: `/tmp/project-${Date.now()}`,
      sessions: []
    };
    
    if (onNewProject) {
      onNewProject(newProject);
    }
  };

  return (
    <aside className="w-64 bg-vscode-sidebar border-r border-vscode-border flex flex-col">
      <div className="p-4 border-b border-vscode-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-vscode-text">Projects</h2>
          <Button
            onClick={handleNewProject}
            size="sm"
            className="bg-vscode-primary hover:bg-vscode-primary-hover text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {!projects || projects.length === 0 ? (
            <div className="text-center text-vscode-text-muted py-8">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No projects found</p>
              <p className="text-xs mt-1">Create a new project to get started</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id || project.name}
                className={`
                  p-3 rounded cursor-pointer transition-colors mb-1
                  ${selectedProject?.name === project.name 
                    ? 'bg-vscode-primary text-white' 
                    : 'hover:bg-vscode-hover text-vscode-text'
                  }
                `}
                onClick={() => onProjectSelect && onProjectSelect(project)}
              >
                <div className="flex items-center">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {project.displayName || project.name}
                  </span>
                </div>
                {project.path && (
                  <div className="text-xs text-vscode-text-muted mt-1 ml-6">
                    {project.path}
                  </div>
                )}
              </div>
            ))
          )}

          {selectedProject && selectedProject.sessions && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-vscode-text-muted mb-2 px-3">Sessions</h3>
              <div className="space-y-1">
                {selectedProject.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      p-2 rounded cursor-pointer text-sm transition-colors mx-2
                      ${selectedSession?.id === session.id 
                        ? 'bg-vscode-primary text-white' 
                        : 'hover:bg-vscode-hover text-vscode-text'
                      }
                    `}
                    onClick={() => onSessionSelect && onSessionSelect(session)}
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
}

export default Sidebar;
