import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateEquipementDto } from './dto/create-equipement.dto';
import { UpdateEquipementDto } from './dto/update-equipement.dto';

@Injectable()
export class EquipementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateEquipementDto) {
    const equipement = await this.prisma.equipement.create({ data: dto });
    await this.auditService.creation('EQUIPEMENT', equipement.id, equipement.nomEquip);
    return equipement;
  }

  async findAll(salleId?: number) {
    const where = salleId ? { salleId } : {};
    return this.prisma.equipement.findMany({
      where,
      include: { salle: { select: { idSalle: true, sigleSalle: true } } },
      orderBy: { nomEquip: 'asc' },
    });
  }

  async findOne(id: number) {
    const equipement = await this.prisma.equipement.findUnique({
      where: { id },
      include: { salle: { select: { idSalle: true, sigleSalle: true } } },
    });
    if (!equipement) throw new NotFoundException(`Équipement #${id} non trouvé`);
    return equipement;
  }

  async update(id: number, dto: UpdateEquipementDto) {
    await this.findOne(id);
    const equipement = await this.prisma.equipement.update({ where: { id }, data: dto });
    await this.auditService.modification('EQUIPEMENT', id, equipement.nomEquip);
    return equipement;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.equipement.delete({ where: { id } });
    await this.auditService.suppression('EQUIPEMENT', id);
  }
}
