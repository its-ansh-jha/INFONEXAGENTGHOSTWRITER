
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Save, Download, Plus, Folder, File } from 'lucide-react';
import { api } from '../utils/api';

const MonacoEditor = ({ selectedProject, onClose }) => {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const editorRef = useRef(null);

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

  const openFile = async (file) => {
    if (activeFile?.name === file.name) return;
    
    setIsLoading(true);
    try {
      const response = await api.getFileContent(selectedProject.name, file.name);
      const data = await response.json();
      setFileContent(data.content || '');
      setActiveFile(file);
    } catch (error) {
      console.error('Error loading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFile = async () => {
    if (!activeFile) return;
    
    setIsSaving(true);
    try {
      await api.saveFile(selectedProject.name, activeFile.name, fileContent);
      await fetchFiles();
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const createNewFile = async () => {
    if (!newFileName.trim()) return;
    
    try {
      await api.saveFile(selectedProject.name, newFileName, '');
      await fetchFiles();
      setNewFileName('');
      setShowNewFileDialog(false);
      
      // Open the newly created file
      const newFile = { name: newFileName };
      openFile(newFile);
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql',
      'php': 'php',
      'cpp': 'cpp',
      'c': 'c',
      'java': 'java',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    return languageMap[ext] || 'plaintext';
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFile();
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Code Editor - {selectedProject?.displayName}
            </h2>
            <Button
              onClick={() => setShowNewFileDialog(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New File
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {activeFile && (
              <Button
                onClick={saveFile}
                disabled={isSaving}
                className="bg-green-600 text-white hover:bg-green-700"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* File Explorer */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Files</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {files.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files yet</p>
                </div>
              ) : (
                files.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => openFile(file)}
                    className={`p-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      activeFile?.name === file.name ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white truncate">
                        {file.name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {activeFile ? (
              <>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activeFile.name}
                    </span>
                  </div>
                </div>
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading file...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language={getLanguage(activeFile.name)}
                      value={fileContent}
                      onChange={setFileContent}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No file selected</h3>
                  <p className="text-sm">Select a file from the explorer or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New File Dialog */}
        {showNewFileDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create New File</h3>
              <Input
                type="text"
                placeholder="filename.ext"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="mb-4"
                onKeyPress={(e) => e.key === 'Enter' && createNewFile()}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setShowNewFileDialog(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createNewFile}
                  disabled={!newFileName.trim()}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>
              {activeFile ? `${getLanguage(activeFile.name).toUpperCase()} • ${fileContent.split('\n').length} lines` : 'No file selected'}
            </span>
            <span>Press Ctrl+S to save</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonacoEditor;
