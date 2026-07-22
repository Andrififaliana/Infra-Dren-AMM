import { create } from 'zustand';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isResponsable: boolean;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isResponsable: false,
  isHydrated: false,

  setAuth: (user: User, token: string) => {
    localStorage.setItem('auth-token', token);
    localStorage.setItem('auth-user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      isResponsable: user.role === 'RESPONSABLE_INFRASTRUCTURE',
      isHydrated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isResponsable: false,
      isHydrated: true,
    });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth-token');
    const userStr = localStorage.getItem('auth-user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
          isResponsable: user.role === 'RESPONSABLE_INFRASTRUCTURE',
          isHydrated: true,
        });
        return;
      } catch {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
      }
    }
    set({ isHydrated: true });
  },
}));
