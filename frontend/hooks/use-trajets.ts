import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Trajet, CreateTrajetDto, UpdateTrajetDto } from '@/types/trajet';
import type { ApiResponse } from '@/types/api';

export function useTrajets() {
  return useQuery({
    queryKey: ['trajets'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Trajet[]>>('/trajets');
      return data.data;
    },
  });
}

export function useTrajet(id: number) {
  return useQuery({
    queryKey: ['trajets', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Trajet>>(`/trajets/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTrajet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateTrajetDto) => {
      const { data } = await apiClient.post<ApiResponse<Trajet>>('/trajets', dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trajets'] }),
  });
}

export function useUpdateTrajet(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateTrajetDto) => {
      const { data } = await apiClient.patch<ApiResponse<Trajet>>(`/trajets/${id}`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trajets'] }),
  });
}

export function useDeleteTrajet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/trajets/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trajets'] }),
  });
}
