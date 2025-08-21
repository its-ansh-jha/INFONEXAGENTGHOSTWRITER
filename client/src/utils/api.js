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

  // File Management
  getProjectFiles: (projectName) => apiFetch(`${API_BASE}/projects/${projectName}/files`),
  getFileContent: (projectName, fileName) => apiFetch(`${API_BASE}/projects/${projectName}/files/${fileName}`),
  saveFile: (projectName, fileName, content) => apiFetch(`${API_BASE}/projects/${projectName}/files/${fileName}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
  downloadProject: (projectName) => {
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = `${API_BASE}/projects/${projectName}/download`;
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  // Conversations API
  conversations: {
    getAll: () => apiFetch(`${API_BASE}/conversations`),
    create: (data) => apiFetch(`${API_BASE}/conversations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    get: (id) => apiFetch(`${API_BASE}/conversations/${id}`),
    update: (id, data) => apiFetch(`${API_BASE}/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id) => apiFetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
    }),
    getMessages: (id) => apiFetch(`${API_BASE}/conversations/${id}/messages`),
    addMessage: (id, data) => apiFetch(`${API_BASE}/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  // Cursor API (legacy - keeping for compatibility)
  cursor: {
    sessions: (projectPath) => apiFetch(`${API_BASE}/cursor/sessions?projectPath=${encodeURIComponent(projectPath)}`),
  },
};