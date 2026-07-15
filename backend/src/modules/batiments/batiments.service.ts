import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateBatimentDto } from './dto/create-batiment.dto';
import { UpdateBatimentDto } from './dto/update-batiment.dto';

@Injectable()
export class BatimentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateBatimentDto) {
    const batiment = await this.prisma.batiment.create({ data: dto });
    await this.auditService.creation('BATIMENT', batiment.idBat, batiment.sigleBat ?? undefined);
    return batiment;
  }

  async findAll(etablissementId?: number) {
    const where = etablissementId ? { etablissementId } : {};
    return this.prisma.batiment.findMany({
      where,
      include: { _count: { select: { salles: true, toilettes: true } }, etablissement: { select: { id: true, nomEtab: true } } },
      orderBy: { sigleBat: 'asc' },
    });
  }

  async findOne(id: number) {
    const batiment = await this.prisma.batiment.findUnique({
      where: { idBat: id },
      include: { etablissement: { select: { id: true, nomEtab: true } }, salles: { include: { _count: { select: { equipements: true, ouvertures: true } } } }, toilettes: true },
    });
    if (!batiment) throw new NotFoundException(`Bâtiment #${id} non trouvé`);
    return batiment;
  }

  async update(id: number, dto: UpdateBatimentDto) {
    await this.findOne(id);
    const batiment = await this.prisma.batiment.update({ where: { idBat: id }, data: dto });
    await this.auditService.modification('BATIMENT', id, batiment.sigleBat ?? undefined);
    return batiment;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.batiment.delete({ where: { idBat: id } });
    await this.auditService.suppression('BATIMENT', id);
  }
}
