import { apiClient } from './client';

export const profileApi = {
  get: () => apiClient.get('/users/profile'),
  update: (data) => apiClient.put('/users/profile', data),
};
