import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import './index.css';

const queryClient = new QueryClient();

interface Project {
  id: string;
  name: string;
  displayName: string;
  path: string;
  sessions?: any[];
}

interface Session {
  id: string;
  title: string;
  lastActivity: string;
}

function AppContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);

        // Auto-select first project if none selected
        if (!selectedProject && data.length > 0) {
          setSelectedProject(data[0]);
        }
      } else {
        console.error('Failed to fetch projects');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedSession(null);
  };

  const onSessionSelect = (session: Session) => {
    setSelectedSession(session);
  };

  const onNewProject = async (projectData: any) => {
    await fetchProjects();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-vscode-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-vscode-background text-vscode-text">
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        selectedSession={selectedSession}
        onProjectSelect={onProjectSelect}
        onSessionSelect={onSessionSelect}
        onNewProject={onNewProject}
        fetchProjects={fetchProjects}
      />
      <MainContent
        selectedProject={selectedProject}
        selectedSession={selectedSession}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;