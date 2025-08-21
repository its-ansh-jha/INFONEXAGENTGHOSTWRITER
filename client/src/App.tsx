
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import NewProjectDialog from './components/NewProjectDialog';
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
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
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
        await fetchProjects();
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
