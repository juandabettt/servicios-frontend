import { apiClient } from './client';

export const autopayApi = {
  getRules: () => apiClient.get('/autopay/rules'),
  createRule: (data) => apiClient.post('/autopay/rules', data),
  updateRule: (id, data) => apiClient.put(`/autopay/rules/${id}`, data),
  deleteRule: (id) => apiClient.delete(`/autopay/rules/${id}`),
  toggleRule: (id, active) => apiClient.patch(`/autopay/rules/${id}/toggle`, { active }),
};
