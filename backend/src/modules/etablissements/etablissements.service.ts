import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateEtablissementDto } from './dto/create-etablissement.dto';
import { UpdateEtablissementDto } from './dto/update-etablissement.dto';
import { EtablissementQueryDto } from './dto/etablissement-query.dto';

@Injectable()
export class EtablissementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateEtablissementDto) {
    const etablissement = await this.prisma.etablissement.create({ data: dto });
    await this.auditService.creation('ETABLISSEMENT', etablissement.id, etablissement.nomEtab);
    return etablissement;
  }

  async findAll(query: EtablissementQueryDto) {
    const { page = 1, limit = 10, search, dren, cisco, commune } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { nomEtab: { contains: search, mode: 'insensitive' } },
        { dren: { contains: search, mode: 'insensitive' } },
        { commune: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (dren) where.dren = { contains: dren, mode: 'insensitive' };
    if (cisco) where.cisco = { contains: cisco, mode: 'insensitive' };
    if (commune) where.commune = { contains: commune, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.etablissement.findMany({
        where, skip, take: limit,
        include: { _count: { select: { batiments: true, designations: true, structures: true } } },
        orderBy: { nomEtab: 'asc' },
      }),
      this.prisma.etablissement.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id },
      include: {
        directeur: true,
        designations: true,
        structures: true,
        batiments: { include: { salles: { include: { _count: { select: { equipements: true, ouvertures: true } } } }, toilettes: true } },
        _count: { select: { batiments: true, designations: true, structures: true } },
      },
    });
    if (!etablissement) throw new NotFoundException(`Établissement #${id} non trouvé`);
    return etablissement;
  }

  async update(id: number, dto: UpdateEtablissementDto) {
    await this.findOne(id);
    const etablissement = await this.prisma.etablissement.update({ where: { id }, data: dto });
    await this.auditService.modification('ETABLISSEMENT', id, etablissement.nomEtab);
    return etablissement;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.etablissement.delete({ where: { id } });
    await this.auditService.suppression('ETABLISSEMENT', id);
  }
}
