import { apiClient } from './client';
import { generateIdempotencyKey } from '../utils/idempotency';

export const paymentsApi = {
  process: (invoiceId, metodoPago, extraData = {}) =>
    apiClient.post('/payments/process', {
      invoiceId,
      metodoPago,
      idempotencyKey: generateIdempotencyKey(),
      ...extraData,
    }),
  getStatus: (transactionId) =>
    apiClient.get(`/payments/${transactionId}/status`),
  getHistory: (params) =>
    apiClient.get('/payments/history', { params }),
};
