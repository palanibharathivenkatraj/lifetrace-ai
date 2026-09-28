import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const healthCheck = () => api.get('/health');

export const loadDemo = (domain) => api.get(`/demo/${domain}`);

export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const analyzeData = (sessionId, targetColumn, domain, contamination = 0.1) =>
  api.post('/analyze', { session_id: sessionId, target_column: targetColumn, domain, contamination });

export const getAnomalies = (limit = 100) => api.get(`/anomalies?limit=${limit}`);

export const getSessions = () => api.get('/sessions');

export default api;
