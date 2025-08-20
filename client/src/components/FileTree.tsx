import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Folder, FileText, FileCode } from 'lucide-react';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileItem[];
  extension?: string;
}

interface FileTreeProps {
  searchQuery: string;
}

// Mock data - replace with actual API calls
const mockProjects: FileItem[] = [
  {
    name: 'my-ai-project',
    type: 'folder',
    path: '/my-ai-project',
    children: [
      { name: 'main.py', type: 'file', path: '/my-ai-project/main.py', extension: 'py' },
      { name: 'utils.js', type: 'file', path: '/my-ai-project/utils.js', extension: 'js' },
      { name: 'README.md', type: 'file', path: '/my-ai-project/README.md', extension: 'md' },
      { name: 'package.json', type: 'file', path: '/my-ai-project/package.json', extension: 'json' },
    ]
  },
  {
    name: 'web-scraper',
    type: 'folder',
    path: '/web-scraper',
    children: []
  },
  {
    name: 'data-analysis',
    type: 'folder',
    path: '/data-analysis',
    children: []
  }
];

const getFileIcon = (extension?: string) => {
  switch (extension) {
    case 'py':
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return <FileCode className="h-4 w-4 text-vscode-primary" />;
    case 'md':
    case 'txt':
      return <FileText className="h-4 w-4 text-vscode-text-muted" />;
    case 'json':
      return <FileText className="h-4 w-4 text-vscode-warning" />;
    default:
      return <FileText className="h-4 w-4 text-vscode-text-muted" />;
  }
};

export default function FileTree({ searchQuery }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/my-ai-project']));
  const [activeFile, setActiveFile] = useState('/my-ai-project/utils.js');

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const selectFile = (path: string) => {
    setActiveFile(path);
    // TODO: Open file in editor
  };

  const filterItems = (items: FileItem[]): FileItem[] => {
    if (!searchQuery) return items;
    
    return items.filter(item => {
      if (item.type === 'file') {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      } else {
        const hasMatchingChildren = item.children && filterItems(item.children).length > 0;
        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || hasMatchingChildren;
      }
    }).map(item => ({
      ...item,
      children: item.children ? filterItems(item.children) : undefined
    }));
  };

  const renderFileTreeItem = (item: FileItem, depth = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const isActive = activeFile === item.path;
    const paddingLeft = depth * 16 + 8;

    if (item.type === 'folder') {
      return (
        <div key={item.path}>
          <Button
            variant="ghost"
            className={`w-full justify-start px-2 py-1.5 h-auto text-sm text-left hover:bg-vscode-bg ${
              isActive ? 'bg-vscode-primary/20 border-l-2 border-vscode-primary' : ''
            }`}
            style={{ paddingLeft }}
            onClick={() => toggleFolder(item.path)}
            data-testid={`button-toggle-folder-${item.name}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 mr-2 text-vscode-text-muted" />
            ) : (
              <ChevronRight className="h-3 w-3 mr-2 text-vscode-text-muted" />
            )}
            <Folder className="h-4 w-4 mr-2 text-vscode-warning" />
            <span className="text-vscode-text">{item.name}</span>
          </Button>
          
          {isExpanded && item.children && (
            <div>
              {item.children.map(child => renderFileTreeItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <Button
          key={item.path}
          variant="ghost"
          className={`w-full justify-start px-2 py-1 h-auto text-sm text-left hover:bg-vscode-bg ${
            isActive ? 'bg-vscode-primary/20 border-l-2 border-vscode-primary' : ''
          }`}
          style={{ paddingLeft }}
          onClick={() => selectFile(item.path)}
          data-testid={`button-open-file-${item.name}`}
        >
          {getFileIcon(item.extension)}
          <span className={`ml-2 ${isActive ? 'text-white' : 'text-vscode-text'}`}>
            {item.name}
          </span>
        </Button>
      );
    }
  };

  const filteredProjects = filterItems(mockProjects);

  return (
    <div className="p-2">
      {filteredProjects.map(project => renderFileTreeItem(project))}
    </div>
  );
}
