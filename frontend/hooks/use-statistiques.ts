import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { StatsGlobales, StatsParDren, StatsParCisco, CouvertureReseau, RepartitionSalles } from '@/types/statistiques';
import type { ApiResponse } from '@/types/api';

export function useStatsGlobales() {
  return useQuery({
    queryKey: ['stats', 'globales'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<StatsGlobales>>('/statistiques/globales');
      return data.data;
    },
  });
}

export function useStatsParDren() {
  return useQuery({
    queryKey: ['stats', 'par-dren'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<StatsParDren[]>>('/statistiques/par-dren');
      return data.data;
    },
  });
}

export function useStatsParCisco() {
  return useQuery({
    queryKey: ['stats', 'par-cisco'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<StatsParCisco[]>>('/statistiques/par-cisco');
      return data.data;
    },
  });
}

export function useCouvertureReseau() {
  return useQuery({
    queryKey: ['stats', 'couverture-reseau'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<CouvertureReseau[]>>('/statistiques/couverture-reseau');
      return data.data;
    },
  });
}

export function useRepartitionSalles() {
  return useQuery({
    queryKey: ['stats', 'repartition-salles'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<RepartitionSalles[]>>('/statistiques/repartition-salles');
      return data.data;
    },
  });
}
