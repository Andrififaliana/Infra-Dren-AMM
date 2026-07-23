import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export interface IaLogEntry {
  id: number;
  userId: number | null;
  userEmail: string | null;
  model: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  responseTimeMs: number;
  promptLength: number;
  responseLength: number;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
  user?: { id: number; nom: string; email: string } | null;
}

export interface IaLogStats {
  totalRequests: number;
  totalSuccess: number;
  totalErrors: number;
  totalTokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  avgResponseTimeMs: number;
}

export function useIaLogs(page: number = 1, limit: number = 50, success?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (success) params.set('success', success);

  return useQuery({
    queryKey: ['ia-logs', page, limit, success],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<IaLogEntry>>(
        `/chat-ia/logs?${params.toString()}`,
      );
      return data;
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
}

export function useIaLogStats() {
  return useQuery({
    queryKey: ['ia-logs-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<IaLogStats>>('/chat-ia/logs/stats');
      return data.data;
    },
    refetchInterval: 60000, // Rafraîchir toutes les 60 secondes
  });
}
