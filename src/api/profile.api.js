import { apiClient } from './client';

export const profileApi = {
  update: (data) => apiClient.put('/users/profile', data),
};
