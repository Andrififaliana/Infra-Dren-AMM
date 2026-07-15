import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';

@Injectable()
export class SallesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateSalleDto) {
    const salle = await this.prisma.salle.create({ data: dto });
    await this.auditService.creation('SALLE', salle.idSalle, salle.sigleSalle ?? `#${salle.idSalle}`);
    return salle;
  }

  async findAll(batimentId?: number) {
    const where = batimentId ? { batimentId } : {};
    return this.prisma.salle.findMany({
      where,
      include: { batiment: { select: { idBat: true, sigleBat: true } }, _count: { select: { equipements: true, ouvertures: true } } },
      orderBy: { niveauSalle: 'asc' },
    });
  }

  async findOne(id: number) {
    const salle = await this.prisma.salle.findUnique({
      where: { idSalle: id },
      include: { batiment: { select: { idBat: true, sigleBat: true } }, equipements: true, ouvertures: true },
    });
    if (!salle) throw new NotFoundException(`Salle #${id} non trouvée`);
    return salle;
  }

  async update(id: number, dto: UpdateSalleDto) {
    await this.findOne(id);
    const salle = await this.prisma.salle.update({ where: { idSalle: id }, data: dto });
    await this.auditService.modification('SALLE', id, salle.sigleSalle ?? `#${id}`);
    return salle;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.salle.delete({ where: { idSalle: id } });
    await this.auditService.suppression('SALLE', id);
  }
}
