import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    const detail = error.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map(item => item.msg).join(', ')
      : detail || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Local file loading
  listLocalDatasets: async () => {
    const res = await apiClient.get('/api/local-files');
    return res.data;
  },
  loadLocalDataset: async (filename) => {
    const res = await apiClient.post('/api/local-files/load', { filename });
    return res.data;
  },
  
  // Upload Dataset
  uploadDataset: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post('/api/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Dataset info
  getDatasetSummary: async (datasetId) => {
    const res = await apiClient.get(`/api/datasets/${datasetId}/summary`);
    return res.data;
  },
  getDatasetSchema: async (datasetId) => {
    const res = await apiClient.get(`/api/datasets/${datasetId}/schema`);
    return res.data;
  },
  
  // Analysis & Vis
  askDataset: async (datasetId, question) => {
    const res = await apiClient.post(`/api/datasets/${datasetId}/ask`, { question });
    return res.data;
  },
  createVisualization: async (datasetId, config) => {
    const res = await apiClient.post(`/api/datasets/${datasetId}/visualize`, config);
    return res.data;
  },
  getDataQuality: async (datasetId) => {
    const res = await apiClient.get(`/api/datasets/${datasetId}/quality`);
    return res.data;
  },
  getInsights: async (datasetId) => {
    const res = await apiClient.get(`/api/datasets/${datasetId}/insights`);
    return res.data;
  },
  generateReport: async (datasetId) => {
    const res = await apiClient.post(`/api/datasets/${datasetId}/reports`);
    return res.data;
  },
  deleteDataset: async (datasetId) => {
    const res = await apiClient.delete(`/api/datasets/${datasetId}`);
    return res.data;
  }
};
