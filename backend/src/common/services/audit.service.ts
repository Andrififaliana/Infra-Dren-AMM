import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEntry {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  entity: string;
  entityId?: number;
  userId?: number;
  details?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enregistre une action dans les logs d'audit.
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.log.create({
        data: {
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          details: entry.details,
          userId: entry.userId,
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
