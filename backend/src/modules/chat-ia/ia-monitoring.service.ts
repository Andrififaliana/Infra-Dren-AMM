import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface IaLogEntry {
  userId?: number | null;
  userEmail?: string | null;
  model: string;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  responseTimeMs: number;
  promptLength: number;
  responseLength: number;
  success: boolean;
  errorMessage?: string | null;
}

export interface IaLogQuery {
  page?: number;
  limit?: number;
  success?: string;
  userId?: number;
}

@Injectable()
export class IaMonitoringService {
  private readonly logger = new Logger(IaMonitoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enregistre une requête IA dans les logs de monitoring
   */
  async log(entry: IaLogEntry): Promise<void> {
    try {
      await this.prisma.iaLog.create({
        data: {
          userId: entry.userId ?? null,
          userEmail: entry.userEmail ?? null,
          model: entry.model,
          promptTokens: entry.promptTokens ?? null,
          completionTokens: entry.completionTokens ?? null,
          totalTokens: entry.totalTokens ?? null,
          responseTimeMs: entry.responseTimeMs,
          promptLength: entry.promptLength,
          responseLength: entry.responseLength,
          success: entry.success,
          errorMessage: entry.errorMessage ?? null,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Erreur lors de l'enregistrement du log IA: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  /**
   * Récupère les logs avec pagination
   */
  async findAll(query: IaLogQuery) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 50)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.success === 'true') where.success = true;
    else if (query.success === 'false') where.success = false;
    if (query.userId) where.userId = query.userId;

    const [data, total] = await Promise.all([
      this.prisma.iaLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nom: true, email: true } },
        },
      }),
      this.prisma.iaLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Statistiques globales des logs IA
   */
  async getStats() {
    const [totalRequests, totalSuccess, totalErrors, tokenStats, avgTime] =
      await Promise.all([
        this.prisma.iaLog.count(),
        this.prisma.iaLog.count({ where: { success: true } }),
        this.prisma.iaLog.count({ where: { success: false } }),
        this.prisma.iaLog.aggregate({
          _sum: { promptTokens: true, completionTokens: true, totalTokens: true },
        }),
        this.prisma.iaLog.aggregate({
          _avg: { responseTimeMs: true },
        }),
      ]);

    return {
      totalRequests,
      totalSuccess,
      totalErrors,
      totalTokens: {
        prompt: tokenStats._sum.promptTokens ?? 0,
        completion: tokenStats._sum.completionTokens ?? 0,
        total: tokenStats._sum.totalTokens ?? 0,
      },
      avgResponseTimeMs: Math.round(avgTime._avg.responseTimeMs ?? 0),
    };
  }

  /**
   * Supprime les logs plus vieux que le nombre de jours spécifié
   */
  async cleanOldLogs(days: number = 90): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.prisma.iaLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    this.logger.log(`${result.count} logs IA nettoyés (plus de ${days} jours)`);
    return result.count;
  }
}
