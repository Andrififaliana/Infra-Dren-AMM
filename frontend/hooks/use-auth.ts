import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/api';

interface LoginDto {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', dto);
      return data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>('/auth/profile');
      return data.data;
    },
    retry: false,
  });
}

export function useVerifyToken() {
  return useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<unknown>>('/auth/verify');
      return data.data;
    },
    retry: false,
  });
}
