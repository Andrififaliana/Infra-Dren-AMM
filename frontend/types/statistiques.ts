export interface StatsGlobales {
  totalEtablissements: number;
  totalBatiments: number;
  totalSalles: number;
  totalEquipements: number;
  totalEnseignants: number;
  totalEleves: number;
  tauxCouvertureTelephonique: number;
  tauxCouvertureInternet: number;
}

export interface StatsParDren {
  dren: string;
  nbEtablissements: number;
  nbBatiments: number;
  nbSalles: number;
}

export interface StatsParCisco {
  cisco: string;
  dren: string;
  nbEtablissements: number;
  nbSalles: number;
}

export interface CouvertureReseau {
  type: 'telephone' | 'internet';
  couvert: number;
  nonCouvert: number;
}

export interface RepartitionSalles {
  etat: string;
  count: number;
}
