import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Ouverture } from '@/types/salle';
import type { Toilette } from '@/types/batiment';
import type { ApiResponse } from '@/types/api';

// ─── Ouvertures ─────────────────────────────────────

export function useOuvertures(salleId: number) {
  return useQuery({
    queryKey: ['salles', salleId, 'ouvertures'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ ouvertures: Ouverture[] }>>(`/salles/${salleId}`);
      return data.data.ouvertures;
    },
    enabled: !!salleId,
  });
}

export function useCreateOuverture(salleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<Ouverture>) => {
      const { data } = await apiClient.post<ApiResponse<Ouverture>>(`/salles/${salleId}/ouvertures`, dto);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salles', salleId] });
    },
  });
}

export function useUpdateOuverture(salleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: Partial<Ouverture> }) => {
      const { data } = await apiClient.patch<ApiResponse<Ouverture>>(`/salles/${salleId}/ouvertures/${id}`, dto);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salles', salleId] });
    },
  });
}

export function useDeleteOuverture(salleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/salles/${salleId}/ouvertures/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salles', salleId] });
    },
  });
}

// ─── Toilettes ───────────────────────────────────────

export function useToilettes(batimentId: number) {
  return useQuery({
    queryKey: ['batiments', batimentId, 'toilettes'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ toilettes: Toilette[] }>>(`/batiments/${batimentId}`);
      return data.data.toilettes;
    },
    enabled: !!batimentId,
  });
}

export function useCreateToilette(batimentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<Toilette>) => {
      const { data } = await apiClient.post<ApiResponse<Toilette>>(`/batiments/${batimentId}/toilettes`, dto);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batiments', batimentId] });
    },
  });
}

export function useUpdateToilette(batimentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: Partial<Toilette> }) => {
      const { data } = await apiClient.patch<ApiResponse<Toilette>>(`/batiments/${batimentId}/toilettes/${id}`, dto);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batiments', batimentId] });
    },
  });
}

export function useDeleteToilette(batimentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/batiments/${batimentId}/toilettes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batiments', batimentId] });
    },
  });
}
