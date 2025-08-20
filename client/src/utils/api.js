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
  createProject: (data) => apiFetch(`${API_BASE}/projects`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Sessions
  sessions: (projectId) => apiFetch(`${API_BASE}/projects/${projectId}/sessions`),
  
  // GPT-5 API
  gpt5: {
    chat: (data) => apiFetch(`${API_BASE}/gpt5/chat`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    generateCode: (data) => apiFetch(`${API_BASE}/gpt5/generate-code`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  // Cursor API (legacy - keeping for compatibility)
  cursor: {
    sessions: (projectPath) => apiFetch(`${API_BASE}/cursor/sessions?projectPath=${encodeURIComponent(projectPath)}`),
  },
};