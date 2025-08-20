import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '../utils/api';

const PreviewPane = ({ selectedProject }) => {
  const [htmlFiles, setHtmlFiles] = useState([]);
  const [selectedHtmlFile, setSelectedHtmlFile] = useState(null);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (selectedProject) {
      fetchHtmlFiles();
    }
  }, [selectedProject]);

  const fetchHtmlFiles = async () => {
    try {
      const response = await api.getProjectFiles(selectedProject.name);
      const data = await response.json();
      const htmlFiles = (data.files || []).filter(file => 
        file.name.endsWith('.html') || file.name.endsWith('.htm')
      );
      setHtmlFiles(htmlFiles);
      
      if (htmlFiles.length > 0 && !selectedHtmlFile) {
        setSelectedHtmlFile(htmlFiles[0]);
      }
    } catch (error) {
      console.error('Error fetching HTML files:', error);
    }
  };

  const loadPreview = async (file) => {
    try {
      const response = await api.getFileContent(selectedProject.name, file.name);
      const data = await response.json();
      setPreviewContent(data.content || '');
      setSelectedHtmlFile(file);
    } catch (error) {
      console.error('Error loading preview:', error);
    }
  };

  useEffect(() => {
    if (selectedHtmlFile) {
      loadPreview(selectedHtmlFile);
    }
  }, [selectedHtmlFile]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-vscode-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-vscode-text">Website Preview</h3>
          {htmlFiles.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-vscode-text-muted">File:</span>
              <select
                value={selectedHtmlFile?.name || ''}
                onChange={(e) => {
                  const file = htmlFiles.find(f => f.name === e.target.value);
                  if (file) setSelectedHtmlFile(file);
                }}
                className="bg-vscode-bg border border-vscode-border text-vscode-text text-sm px-2 py-1 rounded"
              >
                {htmlFiles.map((file, index) => (
                  <option key={index} value={file.name}>
                    {file.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => selectedHtmlFile && loadPreview(selectedHtmlFile)}
                className="bg-vscode-primary text-white hover:bg-vscode-primary/90 text-xs"
              >
                Refresh
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1">
        {htmlFiles.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-vscode-text-muted">
              <h4 className="text-lg font-medium mb-2">No HTML files found</h4>
              <p className="text-sm mb-4">Ask the AI to create a website for you</p>
              <div className="text-xs">
                <p>Try asking:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>"Create a simple website"</li>
                  <li>"Build a portfolio page"</li>
                  <li>"Make a landing page"</li>
                </ul>
              </div>
            </div>
          </div>
        ) : previewContent ? (
          <iframe
            srcDoc={previewContent}
            title="Website Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-vscode-text-muted">
              <h4 className="text-lg font-medium mb-2">Loading preview...</h4>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vscode-primary mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPane;