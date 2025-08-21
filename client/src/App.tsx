
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import NewProjectDialog from './components/NewProjectDialog';

import { useWebSocket } from './utils/websocket';
import { ThemeProvider } from './contexts/ThemeContext';
import { useVersionCheck } from './hooks/useVersionCheck';
import { api } from './utils/api';

// Create a query client
const queryClient = new QueryClient();

// Main App component with routing
function AppContent() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const { updateAvailable, latestVersion, currentVersion } = useVersionCheck('siteboon', 'claudecodeui');
  const [showVersionModal, setShowVersionModal] = useState(false);

  const [projects, setProjects] = useState([]); // Initialize as empty array
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'files'
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showToolsSettings, setShowToolsSettings] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [autoExpandTools, setAutoExpandTools] = useState(() => {
    const saved = localStorage.getItem('autoExpandTools');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showRawParameters, setShowRawParameters] = useState(() => {
    const saved = localStorage.getItem('showRawParameters');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(() => {
    const saved = localStorage.getItem('autoScrollToBottom');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [sendByCtrlEnter, setSendByCtrlEnter] = useState(() => {
    const saved = localStorage.getItem('sendByCtrlEnter');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [activeSessions, setActiveSessions] = useState(new Set());

  const { ws, sendMessage, messages } = useWebSocket();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Fetch initial data
    fetchProjects();
    fetchConversations();
  }, []);

  useEffect(() => {
    // Fetch conversations for selected project
    if (selectedProject) {
      fetchConversations(selectedProject.name);
      setSelectedSession(null); // Clear selected session when project changes
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await api.projects();
      const data = await response.json();

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]); // Ensure projects is always an array
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchConversations = async (projectName?: string) => {
    try {
      setIsLoadingConversations(true);
      const url = projectName ? `/api/conversations?projectName=${projectName}` : '/api/conversations';
      const response = await fetch(url);
      const data = await response.json();

      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]); // Ensure conversations is always an array
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await api.createProject(projectData);
      const result = await response.json();

      if (result.success) {
        // Refresh projects list
        await fetchProjects();
        // Select the new project
        setSelectedProject(result.project);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  return (
    <div className="bg-vscode-bg text-vscode-text font-sans h-screen overflow-hidden">
      <div className="flex h-full">
        <Sidebar 
          projects={projects}
          selectedProject={selectedProject}
          selectedSession={selectedSession}
          onProjectSelect={setSelectedProject}
          onSessionSelect={setSelectedSession}
          onNewProject={() => setShowNewProjectDialog(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          fetchProjects={fetchProjects}
        />
        <NewProjectDialog 
          isOpen={showNewProjectDialog}
          onClose={() => setShowNewProjectDialog(false)}
          onCreateProject={handleCreateProject}
        />
        <MainContent 
          selectedProject={selectedProject}
          selectedSession={selectedSession}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          conversations={conversations}
          isLoadingConversations={isLoadingConversations}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
