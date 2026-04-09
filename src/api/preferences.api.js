import { apiClient } from './client';

export const preferencesApi = {
  get: () => apiClient.get('/preferences'),
  update: (data) => apiClient.put('/preferences', data),
};
