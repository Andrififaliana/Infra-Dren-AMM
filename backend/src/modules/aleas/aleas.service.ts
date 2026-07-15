import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateAleaDto } from './dto/create-alea.dto';
import { UpdateAleaDto } from './dto/update-alea.dto';

@Injectable()
export class AleasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateAleaDto) {
    const { effets, dateAleat, ...aleaData } = dto;
    const alea = await this.prisma.alea.create({
      data: {
        ...aleaData,
        dateAleat: dateAleat ? new Date(dateAleat) : undefined,
        effets: effets?.length ? {
          create: effets.map(e => ({
            trajetId: e.trajetId ?? 0, nbElevesG: e.nbElevesG ?? 0, nbElevesF: e.nbElevesF ?? 0,
            nbEnseignG: e.nbEnseignG ?? 0, nbEnseignF: e.nbEnseignF ?? 0,
          })),
        } : undefined,
      },
      include: { effets: { include: { trajet: true } } },
    });
    await this.auditService.creation('ALEA', alea.idAleat, alea.nomAleat ?? `#${alea.idAleat}`);
    return alea;
  }

  async findAll() {
    return this.prisma.alea.findMany({
      include: { effets: { include: { trajet: { include: { moyens: true } } } } },
      orderBy: { dateAleat: 'desc' },
    });
  }

  async findOne(id: number) {
    const alea = await this.prisma.alea.findUnique({
      where: { idAleat: id },
      include: { effets: { include: { trajet: { include: { moyens: true } } } } },
    });
    if (!alea) throw new NotFoundException(`Aléa #${id} non trouvé`);
    return alea;
  }

  async update(id: number, dto: UpdateAleaDto) {
    await this.findOne(id);
    const alea = await this.prisma.alea.update({
      where: { idAleat: id },
      data: { ...dto, dateAleat: dto.dateAleat ? new Date(dto.dateAleat) : undefined },
    });
    await this.auditService.modification('ALEA', id, alea.nomAleat ?? `#${id}`);
    return alea;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.effetAleat.deleteMany({ where: { aleaId: id } });
    await this.prisma.alea.delete({ where: { idAleat: id } });
    await this.auditService.suppression('ALEA', id);
  }
}
