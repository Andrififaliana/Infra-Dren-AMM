import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Salle, CreateSalleDto, UpdateSalleDto } from '@/types/salle';
import type { ApiResponse } from '@/types/api';

export function useSalles(batimentId?: number) {
  return useQuery({
    queryKey: ['salles', batimentId],
    queryFn: async () => {
      const params = batimentId ? { batimentId } : {};
      const { data } = await apiClient.get<Salle[]>('/salles', { params });
      return data;
    },
  });
}

export function useSalle(id: number) {
  return useQuery({
    queryKey: ['salles', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Salle>>(`/salles/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSalle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateSalleDto) => {
      const { data } = await apiClient.post<ApiResponse<Salle>>('/salles', dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salles'] }),
  });
}

export function useUpdateSalle(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateSalleDto) => {
      const { data } = await apiClient.patch<ApiResponse<Salle>>(`/salles/${id}`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salles'] }),
  });
}

export function useDeleteSalle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/salles/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salles'] }),
  });
}
