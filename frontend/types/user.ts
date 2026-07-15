export type Role = 'ADMIN' | 'RESPONSABLE_INFRASTRUCTURE';

export interface User {
  id: number;
  email: string;
  nom: string;
  role: Role;
  actif: boolean;
  supabaseUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  nom: string;
  password: string;
  role: Role;
}

export interface UpdateUserDto {
  email?: string;
  nom?: string;
  role?: Role;
  actif?: boolean;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  actif?: string;
}
