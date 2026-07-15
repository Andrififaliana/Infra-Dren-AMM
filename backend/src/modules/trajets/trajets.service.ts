import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateTrajetDto } from './dto/create-trajet.dto';
import { UpdateTrajetDto } from './dto/update-trajet.dto';

@Injectable()
export class TrajetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateTrajetDto) {
    const { moyensData, periodeData, ...trajetData } = dto;
    const data: any = { ...trajetData };

    if (moyensData) {
      data.moyens = {
        create: { typeMoyen: moyensData.typeMoyen, dureeMoyen: moyensData.dureeMoyen, distanceMoyen: moyensData.distanceMoyen },
      };
    }
    if (periodeData) {
      data.periode = {
        create: { debutPeriode: new Date(periodeData.debutPeriode), finPeriode: new Date(periodeData.finPeriode) },
      };
    }

    const trajet = await this.prisma.trajet.create({ data, include: { moyens: true, periode: true, effets: true } });
    await this.auditService.creation('TRAJET', trajet.idTrajet, trajet.nomTrajet ?? `#${trajet.idTrajet}`);
    return trajet;
  }

  async findAll() {
    return this.prisma.trajet.findMany({
      include: { moyens: true, periode: true, effets: { include: { alea: true } } },
      orderBy: { nomTrajet: 'asc' },
    });
  }

  async findOne(id: number) {
    const trajet = await this.prisma.trajet.findUnique({
      where: { idTrajet: id },
      include: { moyens: true, periode: true, effets: { include: { alea: true } } },
    });
    if (!trajet) throw new NotFoundException(`Trajet #${id} non trouvé`);
    return trajet;
  }

  async update(id: number, dto: UpdateTrajetDto) {
    await this.findOne(id);
    const trajet = await this.prisma.trajet.update({
      where: { idTrajet: id },
      data: { nomTrajet: dto.nomTrajet, debutTrajet: dto.debutTrajet ? new Date(dto.debutTrajet) : undefined, finTrajet: dto.finTrajet ? new Date(dto.finTrajet) : undefined },
    });
    await this.auditService.modification('TRAJET', id, trajet.nomTrajet ?? `#${id}`);
    return trajet;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.effetAleat.deleteMany({ where: { trajetId: id } });
    await this.prisma.trajet.delete({ where: { idTrajet: id } });
    await this.auditService.suppression('TRAJET', id);
  }
}
