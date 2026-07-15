import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Batiment, CreateBatimentDto, UpdateBatimentDto } from '@/types/batiment';
import type { ApiResponse } from '@/types/api';

export function useBatiments(etablissementId?: number) {
  return useQuery({
    queryKey: ['batiments', etablissementId],
    queryFn: async () => {
      const params = etablissementId ? { etablissementId } : {};
      const { data } = await apiClient.get<ApiResponse<Batiment[]>>('/batiments', { params });
      return data.data;
    },
  });
}

export function useBatiment(id: number) {
  return useQuery({
    queryKey: ['batiments', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Batiment>>(`/batiments/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateBatiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateBatimentDto) => {
      const { data } = await apiClient.post<ApiResponse<Batiment>>('/batiments', dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['batiments'] }),
  });
}

export function useUpdateBatiment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateBatimentDto) => {
      const { data } = await apiClient.patch<ApiResponse<Batiment>>(`/batiments/${id}`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['batiments'] }),
  });
}

export function useDeleteBatiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/batiments/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['batiments'] }),
  });
}
