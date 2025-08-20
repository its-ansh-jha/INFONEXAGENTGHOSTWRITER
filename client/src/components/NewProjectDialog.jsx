import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NewProjectDialog = ({ isOpen, onClose, onCreateProject }) => {
  const [projectName, setProjectName] = useState('');
  const [projectPath, setProjectPath] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateProject({
        name: projectName.trim(),
        path: projectPath.trim() || `./${projectName.trim()}`,
        displayName: projectName.trim()
      });
      setProjectName('');
      setProjectPath('');
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-vscode-surface p-6 rounded-lg border border-vscode-border max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-vscode-text mb-4">Create New Project</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-vscode-text mb-2">
              Project Name
            </label>
            <Input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome Project"
              className="bg-vscode-bg border-vscode-border text-vscode-text"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vscode-text mb-2">
              Project Path (optional)
            </label>
            <Input
              type="text"
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="./my-awesome-project"
              className="bg-vscode-bg border-vscode-border text-vscode-text"
            />
            <p className="text-xs text-vscode-text-muted mt-1">
              Leave empty to use project name as path
            </p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isCreating}
              className="text-vscode-text hover:bg-vscode-hover"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !projectName.trim()}
              className="bg-vscode-primary text-white hover:bg-vscode-primary/90"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectDialog;