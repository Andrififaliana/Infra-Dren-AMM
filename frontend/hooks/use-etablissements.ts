import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Etablissement, EtablissementListe, CreateEtablissementDto, UpdateEtablissementDto, EtablissementQueryDto } from '@/types/etablissement';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

type QueryOptions = Omit<UseQueryOptions<PaginatedResponse<EtablissementListe>>, 'queryKey' | 'queryFn'>;

export function useEtablissements(query: EtablissementQueryDto = {}, options?: QueryOptions) {
  return useQuery({
    queryKey: ['etablissements', query],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<EtablissementListe>>('/etablissements', { params: query });
      return data;
    },
    ...options,
  });
}

export function useEtablissement(id: number) {
  return useQuery({
    queryKey: ['etablissements', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Etablissement>>(`/etablissements/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateEtablissement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateEtablissementDto) => {
      const { data } = await apiClient.post<ApiResponse<Etablissement>>('/etablissements', dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etablissements'] }),
  });
}

export function useUpdateEtablissement(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateEtablissementDto) => {
      const { data } = await apiClient.patch<ApiResponse<Etablissement>>(`/etablissements/${id}`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etablissements'] }),
  });
}

export function useDeleteEtablissement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/etablissements/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etablissements'] }),
  });
}
