import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../api/invoices.api';
import toast from 'react-hot-toast';

export function useInvoices(params = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.getAll(params).then((r) => r.data),
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useUploadInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, propertyId }) => invoicesApi.upload(file, propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useCorrectInvoice(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => invoicesApi.correct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factura guardada correctamente');
    },
  });
}
