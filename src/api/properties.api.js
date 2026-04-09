import { apiClient } from './client';

export const propertiesApi = {
  getAll: () => apiClient.get('/properties'),
  getById: (id) => apiClient.get(`/properties/${id}`),
  create: (data) => apiClient.post('/properties', data),
  update: (id, data) => apiClient.put(`/properties/${id}`, data),
  delete: (id) => apiClient.delete(`/properties/${id}`),
};
