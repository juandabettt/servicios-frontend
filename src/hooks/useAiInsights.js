import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';

export function useRecommendations(params = {}) {
  return useQuery({
    queryKey: ['ai-insights/recommendations', params],
    queryFn: () => aiApi.getRecommendations(params).then((r) => r.data),
  });
}

export function usePredictions(propertyId, serviceType) {
  return useQuery({
    queryKey: ['ai-insights/predictions', propertyId, serviceType],
    queryFn: () => aiApi.getPredictions(propertyId, serviceType).then((r) => r.data),
    enabled: !!propertyId,
  });
}

export function useBenchmark(propertyId, serviceType) {
  return useQuery({
    queryKey: ['ai-insights/benchmark', propertyId, serviceType],
    queryFn: () => aiApi.getBenchmark(propertyId, serviceType).then((r) => r.data),
    enabled: !!propertyId,
  });
}

export function useTriggerAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId) => aiApi.triggerAnalysis(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights/recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights/predictions'] });
    },
  });
}
