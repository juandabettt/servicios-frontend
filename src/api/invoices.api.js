import { apiClient } from './client';

export const invoicesApi = {
  upload: (file, propertyId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('propertyId', propertyId);
    return apiClient.post('/invoices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getById: (id) => apiClient.get(`/invoices/${id}`),
  getAll: (params) => apiClient.get('/invoices', { params }),
  correct: (id, data) => apiClient.put(`/invoices/${id}/correct`, data),
  delete: (id) => apiClient.delete(`/invoices/${id}`),
};
