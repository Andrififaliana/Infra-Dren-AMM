import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ExportEtablissement } from '@/types/etablissement-export';
import type { ApiResponse } from '@/types/api';

export function useEtablissementExport(id: number) {
  return useQuery({
    queryKey: ['etablissements', id, 'export'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ExportEtablissement>>(`/etablissements/${id}/export`);
      return data.data;
    },
    enabled: !!id,
  });
}
