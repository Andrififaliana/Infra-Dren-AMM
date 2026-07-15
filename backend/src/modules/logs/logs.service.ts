import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; action?: string; entity?: string; userId?: string }) {
    const { page = 1, limit = 50, action, entity, userId } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = parseInt(userId);

    const [data, total] = await Promise.all([
      this.prisma.log.findMany({
        where, skip, take: limit,
        include: { user: { select: { id: true, nom: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.log.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
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
