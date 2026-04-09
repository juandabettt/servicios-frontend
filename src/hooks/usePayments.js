import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments.api';
import toast from 'react-hot-toast';

export function usePaymentStatus(transactionId) {
  return useQuery({
    queryKey: ['payment', transactionId],
    queryFn: () => paymentsApi.getStatus(transactionId).then((r) => r.data),
    enabled: !!transactionId,
  });
}

export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, metodoPago, extraData }) =>
      paymentsApi.process(invoiceId, metodoPago, extraData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('¡Pago procesado!');
    },
  });
}

export function usePaymentHistory(params = {}) {
  return useQuery({
    queryKey: ['payments-history', params],
    queryFn: () => paymentsApi.getHistory(params).then((r) => r.data),
  });
}
