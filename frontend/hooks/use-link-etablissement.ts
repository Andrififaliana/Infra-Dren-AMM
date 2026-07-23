'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { EtablissementAlea, EtablissementTrajet } from '@/types/etablissement';

// ─── Aléas liés ─────────────────────────────────────

export function useLinkAlea(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aleaId: number) => {
      const { data } = await apiClient.post<ApiResponse<unknown>>(
        `/etablissements/${etablissementId}/aleas/${aleaId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] });
    },
  });
}

export function useUnlinkAlea(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aleaId: number) => {
      const { data } = await apiClient.delete<ApiResponse<unknown>>(
        `/etablissements/${etablissementId}/aleas/${aleaId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] });
    },
  });
}

export function useLinkedAleas(etablissementId: number) {
  return useQuery({
    queryKey: ['etablissements', etablissementId, 'aleas'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<EtablissementAlea[]>>(
        `/etablissements/${etablissementId}/aleas`,
      );
      return data.data;
    },
    enabled: !!etablissementId,
  });
}

// ─── Trajets liés ───────────────────────────────────

export function useLinkTrajet(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trajetId: number) => {
      const { data } = await apiClient.post<ApiResponse<unknown>>(
        `/etablissements/${etablissementId}/trajets/${trajetId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] });
    },
  });
}

export function useUnlinkTrajet(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trajetId: number) => {
      const { data } = await apiClient.delete<ApiResponse<unknown>>(
        `/etablissements/${etablissementId}/trajets/${trajetId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] });
    },
  });
}

export function useLinkedTrajets(etablissementId: number) {
  return useQuery({
    queryKey: ['etablissements', etablissementId, 'trajets'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<EtablissementTrajet[]>>(
        `/etablissements/${etablissementId}/trajets`,
      );
      return data.data;
    },
    enabled: !!etablissementId,
  });
}
