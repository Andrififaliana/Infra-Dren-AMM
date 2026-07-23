import { Injectable, Logger, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEntry {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  entity: string;
  entityId?: number;
  userId?: number;
  details?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  /**
   * Enregistre une action dans les logs d'audit.
   * Le userId est extrait automatiquement du contexte de requête (via JwtAuthGuard).
   */
  async log(entry: AuditEntry): Promise<void> {
    const userId = this.request?.user?.id ?? entry.userId;
    try {
      await this.prisma.log.create({
        data: {
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          details: entry.details,
          userId,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Erreur lors de la journalisation [${entry.action} ${entry.entity}#${entry.entityId}]: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  /**
   * Raccourci pour logger une création.
   */
  async creation(entity: string, entityId: number, nom?: string): Promise<void> {
    await this.log({
      action: 'CREATE',
      entity,
      entityId,
      details: `Création ${entity.toLowerCase()} ${nom ?? '#' + entityId}`,
    });
  }

  /**
   * Raccourci pour logger une modification.
   */
  async modification(entity: string, entityId: number, nom?: string): Promise<void> {
    await this.log({
      action: 'UPDATE',
      entity,
      entityId,
      details: `Mise à jour ${entity.toLowerCase()} ${nom ?? '#' + entityId}`,
    });
  }

  /**
   * Raccourci pour logger une suppression.
   */
  async suppression(entity: string, entityId: number): Promise<void> {
    await this.log({
      action: 'DELETE',
      entity,
      entityId,
      details: `Suppression ${entity.toLowerCase()} #${entityId}`,
    });
  }

  /**
   * Raccourci pour logger une connexion.
   */
  async connexion(userId: number): Promise<void> {
    await this.log({
      action: 'LOGIN',
      entity: 'AUTH',
      userId,
      details: 'Connexion utilisateur',
    });
  }
}
