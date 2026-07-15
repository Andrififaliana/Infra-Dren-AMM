import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Alea, CreateAleaDto, UpdateAleaDto } from '@/types/alea';
import type { ApiResponse } from '@/types/api';

export function useAleas() {
  return useQuery({
    queryKey: ['aleas'],
    queryFn: async () => {
      const { data } = await apiClient.get<Alea[]>('/aleas');
      return data;
    },
  });
}

export function useAlea(id: number) {
  return useQuery({
    queryKey: ['aleas', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Alea>>(`/aleas/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateAlea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAleaDto) => {
      const { data } = await apiClient.post<ApiResponse<Alea>>('/aleas', dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aleas'] }),
  });
}

export function useUpdateAlea(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateAleaDto) => {
      const { data } = await apiClient.patch<ApiResponse<Alea>>(`/aleas/${id}`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aleas'] }),
  });
}

export function useDeleteAlea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/aleas/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aleas'] }),
  });
}
