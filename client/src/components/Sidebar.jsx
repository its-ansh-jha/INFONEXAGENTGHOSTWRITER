
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Folder, MessageSquare, Settings, Search } from 'lucide-react';

const Sidebar = ({ 
  projects = [], 
  selectedProject, 
  onProjectSelect,
  onNewProject,
  conversations = [],
  selectedConversation,
  onConversationSelect,
  onNewConversation,
  fetchProjects
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project => 
    project.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = () => {
    const projectName = prompt('Enter project name:');
    if (projectName) {
      onNewProject({
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        displayName: projectName,
        path: `/projects/${projectName.toLowerCase().replace(/\s+/g, '-')}`
      });
    }
  };

  const handleCreateConversation = () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }
    
    const title = prompt('Enter conversation title:') || 'New Conversation';
    onNewConversation({
      title,
      projectId: selectedProject.id
    });
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-semibold">GPT-5 Code UI</h1>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Projects Section */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-muted-foreground">Projects</h2>
          <Button
            onClick={handleCreateProject}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onProjectSelect(project)}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                  selectedProject?.id === project.id ? 'bg-accent' : ''
                }`}
              >
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">
                  {project.displayName || project.name}
                </span>
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No projects found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Conversations Section */}
      <div className="px-4 mb-4 flex-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-muted-foreground">Conversations</h2>
          <Button
            onClick={handleCreateConversation}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            disabled={!selectedProject}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                  selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                }`}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">
                  {conversation.title || 'Untitled'}
                </span>
              </div>
            ))}
            {conversations.length === 0 && selectedProject && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No conversations yet
              </div>
            )}
            {!selectedProject && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Select a project to view conversations
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
