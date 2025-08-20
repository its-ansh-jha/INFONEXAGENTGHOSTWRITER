// Base API configuration
const API_BASE = '/api';

// Helper function for authenticated requests
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('auth-token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};

// API methods
export const api = {
  // Projects
  projects: () => authenticatedFetch(`${API_BASE}/projects`),
  
  // Sessions
  sessions: (projectId) => authenticatedFetch(`${API_BASE}/projects/${projectId}/sessions`),
  
  // Claude API
  claude: {
    chat: (data) => authenticatedFetch(`${API_BASE}/claude/chat`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  // Cursor API
  cursor: {
    sessions: (projectPath) => authenticatedFetch(`${API_BASE}/cursor/sessions?projectPath=${encodeURIComponent(projectPath)}`),
  },
};