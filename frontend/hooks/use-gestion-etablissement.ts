import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { Directeur, Designation, Structure } from '@/types/etablissement';

// ─── Directeur ───────────────────────────────────────

export function useUpsertDirecteur(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { nomDirecteur: string; prenomDr?: string; emailDr?: string; telDr?: string }) => {
      const { data } = await apiClient.post<ApiResponse<Directeur>>(`/etablissements/${etablissementId}/directeur`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] }),
  });
}

export function useDeleteDirecteur(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/etablissements/${etablissementId}/directeur`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] }),
  });
}

// ─── Designations ────────────────────────────────────

export function useCreateDesignation(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      nomDesign: string; estEnceinteEtab?: boolean; estTitre?: boolean;
      typeDesignation?: string; numCadastre?: string; superficieDesign?: number; estLitigieux?: boolean;
    }) => {
      const { data } = await apiClient.post<ApiResponse<Designation>>(`/etablissements/${etablissementId}/designations`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] }),
  });
}

export function useUpdateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, etablissementId, ...dto }: {
      id: number; etablissementId: number;
      nomDesign?: string; estEnceinteEtab?: boolean; estTitre?: boolean;
      typeDesignation?: string; numCadastre?: string; superficieDesign?: number; estLitigieux?: boolean;
    }) => {
      const { data } = await apiClient.patch<ApiResponse<Designation>>(`/etablissements/${etablissementId}/designations/${id}`, dto);
      return data.data;
    },
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: ['etablissements', variables.etablissementId] }),
  });
}

export function useDeleteDesignation(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/etablissements/${etablissementId}/designations/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] }),
  });
}

// ─── Structures ──────────────────────────────────────

export function useCreateStructure(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { typeStruc?: string; existenceStruc?: boolean; materiauxStruc?: string; etatStruc?: string }) => {
      const { data } = await apiClient.post<ApiResponse<Structure>>(`/etablissements/${etablissementId}/structures`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] }),
  });
}

export function useUpdateStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, etablissementId, ...dto }: {
      id: number; etablissementId: number;
      typeStruc?: string; existenceStruc?: boolean; materiauxStruc?: string; etatStruc?: string;
    }) => {
      const { data } = await apiClient.patch<ApiResponse<Structure>>(`/etablissements/${etablissementId}/structures/${id}`, dto);
      return data.data;
    },
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: ['etablissements', variables.etablissementId] }),
  });
}

export function useDeleteStructure(etablissementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/etablissements/${etablissementId}/structures/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['etablissements', etablissementId] }),
  });
}
