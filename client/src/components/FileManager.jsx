import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '../utils/api';

const FileManager = ({ selectedProject }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    if (selectedProject) {
      fetchProjectFiles();
    }
  }, [selectedProject]);

  const fetchProjectFiles = async () => {
    try {
      const response = await api.getProjectFiles(selectedProject.name);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    try {
      const response = await api.getFileContent(selectedProject.name, file.name);
      const data = await response.json();
      setFileContent(data.content || '');
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    
    try {
      await api.saveFile(selectedProject.name, selectedFile.name, fileContent);
      await fetchProjectFiles();
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  return (
    <div className="flex h-full">
      {/* File List */}
      <div className="w-1/3 border-r border-vscode-border">
        <div className="p-4 border-b border-vscode-border">
          <h3 className="text-sm font-semibold text-vscode-text">Project Files</h3>
        </div>
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
                  onClick={() => handleFileSelect(file)}
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
        {selectedFile ? (
          <>
            <div className="p-4 border-b border-vscode-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-vscode-text">{selectedFile.name}</h3>
              <Button
                onClick={saveFile}
                className="bg-vscode-primary text-white hover:bg-vscode-primary/90 text-xs"
              >
                Save
              </Button>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-full bg-vscode-bg border border-vscode-border text-vscode-text text-sm font-mono p-4 resize-none focus:outline-none focus:ring-2 focus:ring-vscode-primary"
                placeholder="File content will appear here..."
                spellCheck={false}
              />
            </div>
          </>
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
  );
};

export default FileManager;