// Base API configuration
const API_BASE = '/api';

// Helper function for API requests
export const apiFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
};

// API methods
export const api = {
  // Projects
  projects: () => apiFetch(`${API_BASE}/projects`),
  
  // Sessions
  sessions: (projectId) => apiFetch(`${API_BASE}/projects/${projectId}/sessions`),
  
  // Claude API
  claude: {
    chat: (data) => apiFetch(`${API_BASE}/claude/chat`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  // Cursor API
  cursor: {
    sessions: (projectPath) => apiFetch(`${API_BASE}/cursor/sessions?projectPath=${encodeURIComponent(projectPath)}`),
  },
};