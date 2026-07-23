import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; action?: string; entity?: string; userId?: string }) {
    const pageNum = Math.max(1, parseInt(String(query.page ?? 1), 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(String(query.limit ?? 50), 10)));
    const skip = (pageNum - 1) * limitNum;
    const where: any = {};
    if (query.action) where.action = query.action;
    if (query.entity) where.entity = query.entity;
    if (query.userId) where.userId = parseInt(query.userId, 10);

    const [data, total] = await Promise.all([
      this.prisma.log.findMany({
        where, skip, take: limitNum,
        include: { user: { select: { id: true, nom: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.log.count({ where }),
    ]);
    return { data, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } };
  }

  async findByEntity(entity: string, entityId: number) {
    return this.prisma.log.findMany({
      where: { entity, entityId },
      include: { user: { select: { id: true, nom: true, email: true } } },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
  }

  async getActions() {
    return this.prisma.log.groupBy({
      by: ['action'], _count: { action: true }, orderBy: { _count: { action: 'desc' } },
    });
  }
}
