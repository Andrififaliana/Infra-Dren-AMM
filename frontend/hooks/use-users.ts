import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { User, CreateUserDto, UpdateUserDto, UserQueryDto } from '@/types/user';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export function useUsers(query: UserQueryDto = {}) {
  return useQuery({
    queryKey: ['users', query],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<User>>('/users', { params: query });
      return data;
    },
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateUserDto) => {
      const { data } = await apiClient.post<ApiResponse<User>>('/users', dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateUserDto) => {
      const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, dto);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
