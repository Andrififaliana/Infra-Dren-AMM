export interface EquipementSummary {
  id: number;
  nomEquip: string;
  typeEquip?: string;
  etat?: string;
  quantite: number;
}

export interface Salle {
  idSalle: number;
  sigleSalle?: string;
  niveauSalle: number;
  affectationSalle?: string;
  etatSalle?: string;
  estOperationnel: boolean;
  estElectrifiee: boolean;
  longueurInt?: number;
  hauteurSP?: number;
  nbEleveF: number;
  nbEleveG: number;
  batimentId: number;
  batiment?: { idBat: number; sigleBat?: string };
  equipements?: EquipementSummary[];
  ouvertures?: Ouverture[];
  _count?: { equipements: number; ouvertures: number };
}

export interface SalleSummary {
  idSalle: number;
  sigleSalle?: string;
  niveauSalle: number;
  affectationSalle?: string;
  estOperationnel: boolean;
  nbEleveF: number;
  nbEleveG: number;
}

export interface Ouverture {
  idOuvert: number;
  typeOuvert?: string;
  nbOuvert: number;
  largeurOuvert?: number;
  hauteurOuvert?: number;
  surfaceOuvert?: number;
  salleId: number;
}

export interface CreateSalleDto {
  sigleSalle?: string;
  niveauSalle: number;
  affectationSalle?: string;
  etatSalle?: string;
  estOperationnel?: boolean;
  estElectrifiee?: boolean;
  longueurInt?: number;
  hauteurSP?: number;
  nbEleveF?: number;
  nbEleveG?: number;
  batimentId: number;
}

export interface UpdateSalleDto extends Partial<CreateSalleDto> {}
