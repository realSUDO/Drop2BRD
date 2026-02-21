const API_BASE = "http://localhost:3001/api";

export const api = {
  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  async getProjectChunks(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/chunks`);
    return res.json();
  },

  async uploadFile(projectId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/projects/${projectId}/upload`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },

  async generateBRD(projectId, options = {}) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/generate-brd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    return res.json();
  },

  async getBRD(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/brd`);
    return res.json();
  },

  async renameProject(projectId, name) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  async deleteProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: "DELETE",
    });
    return res.json();
  },

  async editBRD(projectId, changeDescription) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/edit-brd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changeDescription }),
    });
    return res.json();
  },
};
