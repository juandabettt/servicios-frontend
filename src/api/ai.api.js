import { apiClient } from './client';

export const aiApi = {
  triggerAnalysis: (propertyId) =>
    apiClient.post('/ai-insights/analyze', { propertyId }),
  getRecommendations: (params) =>
    apiClient.get('/ai-insights/recommendations', { params, silent: true }),
  getPredictions: (propertyId, serviceType) =>
    apiClient.get('/ai-insights/predictions', { params: { propertyId, serviceType } }),
  getBenchmark: (propertyId, serviceType) =>
    apiClient.get('/ai-insights/benchmark', { params: { propertyId, serviceType } }),
  submitFeedback: (analysisId, calificacion) =>
    apiClient.post(`/ai-insights/${analysisId}/feedback`, { calificacion }),
};
