import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Equipement, CreateEquipementDto, UpdateEquipementDto } from '@/types/equipement';
import type { ApiResponse } from '@/types/api';

export function useEquipements(salleId?: number) {
  return useQuery({
    queryKey: ['equipements', salleId],
    queryFn: async () => {
      const params = salleId ? { salleId } : {};
      const { data } = await apiClient.get<ApiResponse<Equipement[]>>('/equipements', { params });
      return data.data;
    },
  });
}

export function useEquipement(id: number) {
  return useQuery({
    queryKey: ['equipements', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Equipement>>(`/equipements/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateEquipement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateEquipementDto) => {
      const { data } = await apiClient.post<ApiResponse<Equipement>>('/equipements', dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipements'] }),
  });
}

export function useUpdateEquipement(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateEquipementDto) => {
      const { data } = await apiClient.patch<ApiResponse<Equipement>>(`/equipements/${id}`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipements'] }),
  });
}

export function useDeleteEquipement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/equipements/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipements'] }),
  });
}
