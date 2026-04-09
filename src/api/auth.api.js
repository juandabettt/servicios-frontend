import { apiClient } from './client';

export const authApi = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }, { _noToast: true }),
  register: (data) =>
    apiClient.post('/auth/register', data, { _noToast: true }),
  refresh: (refreshToken) =>
    apiClient.post('/auth/refresh', { refreshToken }),
  logout: () =>
    apiClient.post('/auth/logout'),
};
