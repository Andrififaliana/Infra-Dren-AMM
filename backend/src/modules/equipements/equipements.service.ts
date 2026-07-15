import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEquipementDto } from './dto/create-equipement.dto';
import { UpdateEquipementDto } from './dto/update-equipement.dto';

@Injectable()
export class EquipementsService {
  private readonly logger = new Logger(EquipementsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEquipementDto) {
    const equipement = await this.prisma.equipement.create({ data: dto });
    await this.logAction('CREATE', 'EQUIPEMENT', equipement.id, `Création équipement ${equipement.nomEquip}`);
    return equipement;
  }

  async findAll(salleId?: number) {
    const where = salleId ? { salleId } : {};
    return this.prisma.equipement.findMany({
      where,
      include: {
        salle: { select: { idSalle: true, sigleSalle: true } },
      },
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
    await this.logAction('UPDATE', 'EQUIPEMENT', id, `Mise à jour équipement ${equipement.nomEquip}`);
    return equipement;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.equipement.delete({ where: { id } });
    await this.logAction('DELETE', 'EQUIPEMENT', id, `Suppression équipement #${id}`);
  }

  private async logAction(action: string, entity: string, entityId: number, details: string) {
    try { await this.prisma.log.create({ data: { action, entity, entityId, details } }); }
    catch (error) { this.logger.warn(`Erreur journalisation: ${error}`); }
  }
}
