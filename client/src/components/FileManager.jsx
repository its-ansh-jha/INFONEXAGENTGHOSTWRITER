
import { useState, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Save, FileText, Plus } from 'lucide-react';

const FileManager = ({ selectedProject }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectFiles();
    }
  }, [selectedProject]);

  const fetchProjectFiles = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${selectedProject.name}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        console.error('Failed to fetch files');
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (!selectedProject) return;
    
    setSelectedFile(file);
    try {
      const response = await fetch(`/api/projects/${selectedProject.name}/files/${file.name}`);
      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content || '');
      } else {
        console.error('Failed to fetch file content');
        setFileContent('');
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('');
    }
  };

  const saveFile = async () => {
    if (!selectedFile || !selectedProject) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${selectedProject.name}/files/${selectedFile.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: fileContent }),
      });

      if (response.ok) {
        console.log('File saved successfully');
        await fetchProjectFiles(); // Refresh file list
      } else {
        const error = await response.text();
        console.error('Failed to save file:', error);
        alert('Failed to save file: ' + error);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const createNewFile = async () => {
    if (!selectedProject) return;
    
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    
    try {
      const response = await fetch(`/api/projects/${selectedProject.name}/files/${fileName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: '' }),
      });

      if (response.ok) {
        await fetchProjectFiles();
        // Auto-select the new file
        const newFile = { name: fileName, type: 'text' };
        setSelectedFile(newFile);
        setFileContent('');
      } else {
        const error = await response.text();
        console.error('Failed to create file:', error);
        alert('Failed to create file: ' + error);
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Error creating file: ' + error.message);
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex h-full items-center justify-center text-vscode-text-muted">
        <div className="text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select a project to view files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* File List */}
      <div className="w-1/3 border-r border-vscode-border">
        <div className="p-4 border-b border-vscode-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-vscode-text">Project Files</h3>
            <Button
              onClick={createNewFile}
              size="sm"
              className="bg-vscode-primary hover:bg-vscode-primary-hover text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2">
            {loading ? (
              <div className="text-center text-vscode-text-muted py-8">
                <p className="text-sm">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center text-vscode-text-muted py-8">
                <p className="text-sm">No files created yet</p>
                <p className="text-xs mt-2">Create a new file to get started</p>
              </div>
            ) : (
              files.map((file, index) => (
                <div
                  key={index}
                  onClick={() => handleFileSelect(file)}
                  className={`p-2 rounded cursor-pointer text-sm flex items-center ${
                    selectedFile?.name === file.name
                      ? 'bg-vscode-primary text-white'
                      : 'text-vscode-text hover:bg-vscode-hover'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
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
                disabled={saving}
                size="sm"
                className="bg-vscode-primary hover:bg-vscode-primary-hover text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <div className="flex-1">
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-full p-4 bg-vscode-background text-vscode-text border-none outline-none resize-none font-mono text-sm"
                placeholder="Start typing your code here..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-vscode-text-muted">
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a file to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
