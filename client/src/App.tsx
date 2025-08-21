/*
 * App.jsx - Main Application Component with Session Protection System
 * 
 * SESSION PROTECTION SYSTEM OVERVIEW:
 * ===================================
 * 
 * Problem: Automatic project updates from WebSocket would refresh the sidebar and clear chat messages
 * during active conversations, creating a poor user experience.
 * 
 * Solution: Track "active sessions" and pause project updates during conversations.
 * 
 * How it works:
 * 1. When user sends message → session marked as "active" 
 * 2. Project updates are skipped while session is active
 * 3. When conversation completes/aborts → session marked as "inactive"
 * 4. Project updates resume normally
 * 
 * Handles both existing sessions (with real IDs) and new sessions (with temporary IDs).
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import NewProjectDialog from './components/NewProjectDialog';

import { useWebSocket } from './utils/websocket';
import { ThemeProvider } from './contexts/ThemeContext';
import { useVersionCheck } from './hooks/useVersionCheck';
import { api } from './utils/api';


// Main App component with routing
function AppContent() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const { updateAvailable, latestVersion, currentVersion } = useVersionCheck('siteboon', 'claudecodeui');
  const [showVersionModal, setShowVersionModal] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'files'
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
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
  // Session Protection System: Track sessions with active conversations to prevent
  // automatic project updates from interrupting ongoing chats. When a user sends
  // a message, the session is marked as "active" and project updates are paused
  // until the conversation completes or is aborted.
  const [activeSessions, setActiveSessions] = useState(new Set()); // Track sessions with active conversations
  
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
    // Fetch projects on component mount
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await api.projects();
      const data = await response.json();
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoadingProjects(false);
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
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
