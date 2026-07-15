import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';

@Injectable()
export class SallesService {
  private readonly logger = new Logger(SallesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSalleDto) {
    const salle = await this.prisma.salle.create({ data: dto });
    await this.logAction('CREATE', 'SALLE', salle.idSalle, `Création de la salle ${salle.sigleSalle ?? '#' + salle.idSalle}`);
    return salle;
  }

  async findAll(batimentId?: number) {
    const where = batimentId ? { batimentId } : {};
    return this.prisma.salle.findMany({
      where,
      include: {
        batiment: { select: { idBat: true, sigleBat: true } },
        _count: { select: { equipements: true, ouvertures: true } },
      },
      orderBy: { niveauSalle: 'asc' },
    });
  }

  async findOne(id: number) {
    const salle = await this.prisma.salle.findUnique({
      where: { idSalle: id },
      include: {
        batiment: { select: { idBat: true, sigleBat: true } },
        equipements: true,
        ouvertures: true,
      },
    });

    if (!salle) {
      throw new NotFoundException(`Salle #${id} non trouvée`);
    }

    return salle;
  }

  async update(id: number, dto: UpdateSalleDto) {
    await this.findOne(id);
    const salle = await this.prisma.salle.update({ where: { idSalle: id }, data: dto });
    await this.logAction('UPDATE', 'SALLE', id, `Mise à jour de la salle ${salle.sigleSalle ?? '#' + id}`);
    return salle;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.salle.delete({ where: { idSalle: id } });
    await this.logAction('DELETE', 'SALLE', id, `Suppression de la salle #${id}`);
  }

  private async logAction(action: string, entity: string, entityId: number, details: string) {
    try {
      await this.prisma.log.create({ data: { action, entity, entityId, details } });
    } catch (error) {
      this.logger.warn(`Erreur journalisation: ${error}`);
    }
  }
}
