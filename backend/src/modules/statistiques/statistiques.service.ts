import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatistiquesService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobales() {
    const [nbEtablissements, nbBatiments, nbSalles, nbEquipements, nbTrajets, nbAleas, nbUtilisateurs] = await Promise.all([
      this.prisma.etablissement.count(),
      this.prisma.batiment.count(),
      this.prisma.salle.count(),
      this.prisma.equipement.count(),
      this.prisma.trajet.count(),
      this.prisma.alea.count(),
      this.prisma.user.count(),
    ]);
    return { etablissements: nbEtablissements, batiments: nbBatiments, salles: nbSalles, equipements: nbEquipements, trajets: nbTrajets, aleas: nbAleas, utilisateurs: nbUtilisateurs };
  }

  async getParDren() {
    return this.prisma.etablissement.groupBy({
      by: ['dren'], _count: { id: true },
      _sum: { nbEnseignantG: true, nbEnseignantF: true, nbSectionG: true, nbSectionF: true },
      orderBy: { dren: 'asc' },
    });
  }

  async getParCisco() {
    return this.prisma.etablissement.groupBy({
      by: ['cisco'], _count: { id: true }, orderBy: { cisco: 'asc' },
    });
  }

  async getCouvertureReseau() {
    const total = await this.prisma.etablissement.count();
    const avecTel = await this.prisma.etablissement.count({ where: { couvTelephonique: true } });
    const avecInternet = await this.prisma.etablissement.count({ where: { couvInternet: true } });
    return {
      total,
      couvertureTelephonique: { nombre: avecTel, pourcentage: total > 0 ? Math.round((avecTel / total) * 100) : 0 },
      couvertureInternet: { nombre: avecInternet, pourcentage: total > 0 ? Math.round((avecInternet / total) * 100) : 0 },
    };
  }

  async getRepartitionSalles() {
    const salles = await this.prisma.salle.findMany({
      select: { affectationSalle: true, etatSalle: true },
    });
    const parAffectation: Record<string, number> = {};
    const parEtat: Record<string, number> = {};
    for (const s of salles) {
      const aff = s.affectationSalle ?? 'NON_DEFINI';
      parAffectation[aff] = (parAffectation[aff] ?? 0) + 1;
      const et = s.etatSalle ?? 'NON_DEFINI';
      parEtat[et] = (parEtat[et] ?? 0) + 1;
    }
    return { total: salles.length, parAffectation, parEtat };
  }
}
