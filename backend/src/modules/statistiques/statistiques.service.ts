import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatistiquesService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobales() {
    const [nbEtablissements, nbBatiments, nbSalles, nbEquipements] = await Promise.all([
      this.prisma.etablissement.count(),
      this.prisma.batiment.count(),
      this.prisma.salle.count(),
      this.prisma.equipement.count(),
    ]);
    const [sumEnsG, sumEnsF] = await Promise.all([
      this.prisma.etablissement.aggregate({ _sum: { nbEnseignantG: true } }),
      this.prisma.etablissement.aggregate({ _sum: { nbEnseignantF: true } }),
    ]);
    const sumEleves = await this.prisma.salle.aggregate({
      _sum: { nbEleveG: true, nbEleveF: true },
    });
    const avecTel = await this.prisma.etablissement.count({ where: { couvTelephonique: true } });
    const avecInternet = await this.prisma.etablissement.count({ where: { couvInternet: true } });
    const totalEnseignants = (sumEnsG._sum.nbEnseignantG ?? 0) + (sumEnsF._sum.nbEnseignantF ?? 0);
    const totalEleves = (sumEleves._sum.nbEleveG ?? 0) + (sumEleves._sum.nbEleveF ?? 0);
    return {
      totalEtablissements: nbEtablissements,
      totalBatiments: nbBatiments,
      totalSalles: nbSalles,
      totalEquipements: nbEquipements,
      totalEnseignants,
      totalEleves,
      tauxCouvertureTelephonique: nbEtablissements > 0 ? Math.round((avecTel / nbEtablissements) * 100) : 0,
      tauxCouvertureInternet: nbEtablissements > 0 ? Math.round((avecInternet / nbEtablissements) * 100) : 0,
    };
  }

  async getParDren() {
    const grouped = await this.prisma.etablissement.groupBy({
      by: ['dren'],
      _count: { id: true },
      orderBy: { dren: 'asc' },
    });
    const etabs = await this.prisma.etablissement.findMany({
      select: { dren: true, _count: { select: { batiments: true } } },
    });
    const batimentsParDren: Record<string, number> = {};
    for (const e of etabs) {
      const key = e.dren ?? '';
      batimentsParDren[key] = (batimentsParDren[key] ?? 0) + e._count.batiments;
    }
    const batiments = await this.prisma.batiment.findMany({
      select: { etablissement: { select: { dren: true } }, _count: { select: { salles: true } } },
    });
    const sallesParDren: Record<string, number> = {};
    for (const b of batiments) {
      const key = b.etablissement?.dren ?? '';
      sallesParDren[key] = (sallesParDren[key] ?? 0) + b._count.salles;
    }
    return grouped.map(g => ({
      dren: g.dren ?? '',
      nbEtablissements: g._count.id,
      nbBatiments: batimentsParDren[g.dren ?? ''] ?? 0,
      nbSalles: sallesParDren[g.dren ?? ''] ?? 0,
    }));
  }

  async getParCisco() {
    const grouped = await this.prisma.etablissement.groupBy({
      by: ['cisco'],
      _count: { id: true },
      orderBy: { cisco: 'asc' },
    });
    const etabs = await this.prisma.etablissement.findMany({
      select: { cisco: true, dren: true, _count: { select: { batiments: true } } },
    });
    const salles = await this.prisma.batiment.findMany({
      select: { etablissement: { select: { cisco: true } }, _count: { select: { salles: true } } },
    });
    const sallesParCisco: Record<string, number> = {};
    for (const b of salles) {
      const key = b.etablissement?.cisco ?? '';
      sallesParCisco[key] = (sallesParCisco[key] ?? 0) + b._count.salles;
    }
    const drenParCisco: Record<string, string> = {};
    for (const e of etabs) {
      const key = e.cisco ?? '';
      if (e.dren) drenParCisco[key] = e.dren;
    }
    return grouped.map(g => ({
      cisco: g.cisco ?? '',
      dren: drenParCisco[g.cisco ?? ''] ?? '',
      nbEtablissements: g._count.id,
      nbSalles: sallesParCisco[g.cisco ?? ''] ?? 0,
    }));
  }

  async getCouvertureReseau() {
    const total = await this.prisma.etablissement.count();
    const avecTel = await this.prisma.etablissement.count({ where: { couvTelephonique: true } });
    const avecInternet = await this.prisma.etablissement.count({ where: { couvInternet: true } });
    return [
      { type: 'telephone' as const, couvert: total > 0 ? Math.round((avecTel / total) * 100) : 0 },
      { type: 'internet' as const, couvert: total > 0 ? Math.round((avecInternet / total) * 100) : 0 },
    ];
  }

  async getRepartitionSalles() {
    const salles = await this.prisma.salle.findMany({
      select: { etatSalle: true },
    });
    const parEtat: Record<string, number> = {};
    for (const s of salles) {
      const et = s.etatSalle ?? 'NON_DEFINI';
      parEtat[et] = (parEtat[et] ?? 0) + 1;
    }
    return Object.entries(parEtat).map(([etat, count]) => ({ etat, count }));
  }
}
