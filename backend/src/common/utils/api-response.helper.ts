import { NotFoundException, ConflictException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';

/**
 * Soulève une NotFoundException avec un message formaté.
 */
export function notFound(entity: string, id: number | string): never {
  throw new NotFoundException(`${entity} #${id} non trouvé`);
}

/**
 * Soulève une ConflictException avec un message.
 */
export function conflict(message: string): never {
  throw new ConflictException(message);
}

/**
 * Soulève une BadRequestException avec un message.
 */
export function badRequest(message: string): never {
  throw new BadRequestException(message);
}

/**
 * Soulève une UnauthorizedException avec un message.
 */
export function unauthorized(message: string = 'Non authentifié'): never {
  throw new UnauthorizedException(message);
}

/**
 * Soulève une ForbiddenException avec un message.
 */
export function forbidden(message: string = 'Accès non autorisé'): never {
  throw new ForbiddenException(message);
}

/**
 * Messages d'erreur prédéfinis en français.
 */
export const ErrorMessages = {
  NOT_FOUND: (entity: string, id: number | string) => `${entity} #${id} non trouvé`,
  NOT_FOUND_ENTITY: (entity: string) => `${entity} non trouvé`,
  ALREADY_EXISTS: (field: string, value: string) => `Un(e) ${field} '${value}' existe déjà`,
  INVALID_ID: 'L\'identifiant doit être un nombre entier positif',
  INVALID_EMAIL: 'Email invalide',
  REQUIRED_FIELD: (field: string) => `Le champ '${field}' est requis`,
  UNAUTHORIZED: 'Email ou mot de passe incorrect',
  FORBIDDEN: 'Accès non autorisé',
  ACCOUNT_DISABLED: 'Compte désactivé',
};
