export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';
export const CURRENT_USER_KEY = 'currentUser';

export enum Role {
  ADMIN = 'ADMIN',
  RESPONSABLE_INFRASTRUCTURE = 'RESPONSABLE_INFRASTRUCTURE',
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.ADMIN]: 100,
  [Role.RESPONSABLE_INFRASTRUCTURE]: 50,
};
