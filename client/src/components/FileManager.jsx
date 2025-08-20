import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '../utils/api';
import MonacoEditor from './MonacoEditor';

const FileManager = ({ selectedProject }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      fetchFiles();
    }
  }, [selectedProject]);

  const fetchFiles = async () => {
    try {
      const response = await api.getProjectFiles(selectedProject.name);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileClick = async (file) => {
    try {
      const response = await api.getFileContent(selectedProject.name, file.name);
      const data = await response.json();
      setSelectedFile({
        ...file,
        content: data.content || ''
      });
      setIsEditorOpen(true);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;

    try {
      // Create new file with empty content
      await api.saveFileContent(selectedProject.name, newFileName.trim(), '');

      // Open the new file in editor
      setSelectedFile({
        name: newFileName.trim(),
        content: ''
      });
      setIsEditorOpen(true);

      // Reset form
      setNewFileName('');
      setShowCreateForm(false);

      // Refresh file list
      await fetchFiles();
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const handleSaveFile = async (fileName, content) => {
    try {
      await api.saveFileContent(selectedProject.name, fileName, content);
      await fetchFiles(); // Refresh the file list
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-vscode-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-vscode-text">Project Files</h3>
            {selectedProject && (
              <p className="text-sm text-vscode-text-muted">{selectedProject.name}</p>
            )}
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-vscode-primary text-white hover:bg-vscode-primary/90 text-sm"
          >
            + New File
          </Button>
        </div>

        {/* Create File Form */}
        {showCreateForm && (
          <div className="mt-3 p-3 bg-vscode-surface border border-vscode-border rounded">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter file name (e.g., index.html, app.js)"
                className="flex-1 bg-vscode-bg border border-vscode-border text-vscode-text px-2 py-1 text-sm rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFile();
                  }
                }}
              />
              <Button
                onClick={handleCreateFile}
                className="bg-green-600 text-white hover:bg-green-700 text-sm px-3 py-1"
              >
                Create
              </Button>
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewFileName('');
                }}
                className="bg-gray-600 text-white hover:bg-gray-700 text-sm px-3 py-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-full">
        {/* File List */}
        <div className="w-1/3 border-r border-vscode-border">
          <ScrollArea className="h-full">
            <div className="p-2">
              {files.length === 0 ? (
                <div className="text-center text-vscode-text-muted py-8">
                  <p className="text-sm">No files created yet</p>
                  <p className="text-xs mt-2">Ask the AI to create files for your project</p>
                </div>
              ) : (
                files.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => handleFileClick(file)}
                    className={`p-2 rounded cursor-pointer text-sm ${
                      selectedFile?.name === file.name
                        ? 'bg-vscode-primary text-white'
                        : 'text-vscode-text hover:bg-vscode-hover'
                    }`}
                  >
                    {file.name}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* File Editor */}
        <div className="flex-1 flex flex-col">
          {isEditorOpen && selectedFile ? (
            <MonacoEditor
              fileName={selectedFile.name}
              initialContent={selectedFile.content}
              onSave={handleSaveFile}
              onClose={() => {
                setIsEditorOpen(false);
                setSelectedFile(null);
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-vscode-text-muted">
                <h4 className="text-lg font-medium mb-2">No file selected</h4>
                <p className="text-sm">Select a file from the list to view and edit its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;