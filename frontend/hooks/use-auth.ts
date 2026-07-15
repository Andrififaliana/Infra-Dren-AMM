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
  access_token: string;
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', dto);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
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
      const { data } = await apiClient.get('/auth/verify');
      return data;
    },
    retry: false,
  });
}
