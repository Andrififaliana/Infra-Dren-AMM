import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  constructor(private readonly prisma: PrismaService) {}

  async exportAll() {
    const result: Record<string, any> = { exportedAt: new Date().toISOString(), version: '1.0', data: {} };
    const models: Record<string, () => Promise<any>> = {
      utilisateurs: () => this.prisma.user.findMany(),
      etablissements: () => this.prisma.etablissement.findMany(),
      directeurs: () => this.prisma.directeur.findMany(),
      designations: () => this.prisma.designation.findMany(),
      structures: () => this.prisma.structure.findMany(),
      batiments: () => this.prisma.batiment.findMany(),
      salles: () => this.prisma.salle.findMany(),
      ouvertures: () => this.prisma.ouverture.findMany(),
      toilettes: () => this.prisma.toilette.findMany(),
      equipements: () => this.prisma.equipement.findMany(),
      trajets: () => this.prisma.trajet.findMany(),
      moyens: () => this.prisma.moyens.findMany(),
      periodesDifficiles: () => this.prisma.periodeDifficile.findMany(),
      aleas: () => this.prisma.alea.findMany(),
      effetsAleat: () => this.prisma.effetAleat.findMany(),
      logs: () => this.prisma.log.findMany(),
    };
    for (const [key, query] of Object.entries(models)) {
      try { result.data[key] = await query(); } catch { result.data[key] = []; }
    }
    return result;
  }

  async exportEtablissement(id: number) {
    const data = await this.prisma.etablissement.findUnique({
      where: { id },
      include: { directeur: true, designations: true, structures: true, batiments: { include: { salles: { include: { equipements: true, ouvertures: true } }, toilettes: true } } },
    });
    return { exportedAt: new Date().toISOString(), data };
  }
}
