import { auth } from '../firebase';

const API_BASE = import.meta.env.PROD 
  ? "https://fairy-nonprophetic-noncohesively.ngrok-free.dev/api"
  : "http://localhost:3001/api";

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  return { 'Content-Type': 'application/json' };
};

export const api = {
  async getProjects() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/projects`, { headers });
    return res.json();
  },

  async getProjectChunks(projectId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/projects/${projectId}/chunks`, { headers });
    return res.json();
  },

  async uploadFile(projectId, file) {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : '';
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/projects/${projectId}/upload`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    return res.json();
  },

  async generateBRD(projectId, options = {}) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/projects/${projectId}/generate-brd`, {
      method: "POST",
      headers,
      body: JSON.stringify(options),
    });
    return res.json();
  },

  async getBRD(projectId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/projects/${projectId}/brd`, { headers });
    return res.json();
  },

  async renameProject(projectId, name) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/projects/${projectId}/rename`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  async deleteProject(projectId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: "DELETE",
      headers,
    });
    return res.json();
  },

  async editBRD(projectId, changeDescription) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/projects/${projectId}/edit-brd`, {
      method: "POST",
      headers,
      body: JSON.stringify({ changeDescription }),
    });
    return res.json();
  },
};
