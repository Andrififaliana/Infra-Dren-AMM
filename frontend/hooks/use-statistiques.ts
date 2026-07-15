import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { StatsGlobales, StatsParDren, StatsParCisco, CouvertureReseau, RepartitionSalles } from '@/types/statistiques';

export function useStatsGlobales() {
  return useQuery({
    queryKey: ['stats', 'globales'],
    queryFn: async () => {
      const { data } = await apiClient.get<StatsGlobales>('/statistiques/globales');
      return data;
    },
  });
}

export function useStatsParDren() {
  return useQuery({
    queryKey: ['stats', 'par-dren'],
    queryFn: async () => {
      const { data } = await apiClient.get<StatsParDren[]>('/statistiques/par-dren');
      return data;
    },
  });
}

export function useStatsParCisco() {
  return useQuery({
    queryKey: ['stats', 'par-cisco'],
    queryFn: async () => {
      const { data } = await apiClient.get<StatsParCisco[]>('/statistiques/par-cisco');
      return data;
    },
  });
}

export function useCouvertureReseau() {
  return useQuery({
    queryKey: ['stats', 'couverture-reseau'],
    queryFn: async () => {
      const { data } = await apiClient.get<CouvertureReseau[]>('/statistiques/couverture-reseau');
      return data;
    },
  });
}

export function useRepartitionSalles() {
  return useQuery({
    queryKey: ['stats', 'repartition-salles'],
    queryFn: async () => {
      const { data } = await apiClient.get<RepartitionSalles[]>('/statistiques/repartition-salles');
      return data;
    },
  });
}
