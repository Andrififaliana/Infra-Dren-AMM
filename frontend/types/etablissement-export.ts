export interface ExportToilette {
  idToilette: number;
  nbCompartiment: number;
  fonctionToilette?: string;
  pointEau: boolean;
}

export interface ExportOuverture {
  idOuvert: number;
  typeOuvert?: string;
  nbOuvert: number;
  largeurOuvert?: number;
  hauteurOuvert?: number;
  surfaceOuvert?: number;
}

export interface ExportEquipement {
  id: number;
  nomEquip: string;
  typeEquip?: string;
  etat?: string;
  quantite: number;
}

export interface ExportSallePhoto {
  id: number;
  key: string;
  url: string;
  originalName?: string | null;
  estPrincipale: boolean;
}

export interface ExportSalle {
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
  equipements: ExportEquipement[];
  ouvertures: ExportOuverture[];
  photos: ExportSallePhoto[];
}

export interface ExportBatimentPhoto {
  id: number;
  key: string;
  url: string;
  originalName?: string | null;
  estPrincipale: boolean;
}

export interface ExportBatiment {
  idBat: number;
  sigleBat?: string;
  nbNiveau: number;
  anneeRecProvC?: string;
  anneeDefC?: string;
  dispositifAc?: string;
  toilettes: ExportToilette[];
  salles: ExportSalle[];
  photos: ExportBatimentPhoto[];
}

export interface ExportDirecteur {
  idDirecteur: number;
  nomDirecteur: string;
  prenomDr?: string;
  emailDr?: string;
  telDr?: string;
}

export interface ExportDesignation {
  idDesign: number;
  nomDesign: string;
  estEnceinteEtab: boolean;
  estTitre: boolean;
  typeDesignation?: string;
  numCadastre?: string;
  superficieDesign?: number;
  estLitigieux: boolean;
}

export interface ExportStructure {
  idStruc: number;
  typeStruc?: string;
  existenceStruc: boolean;
  materiauxStruc?: string;
  etatStruc?: string;
}

export interface ExportPhoto {
  id: number;
  key: string;
  url: string;
  originalName?: string | null;
  estPrincipale: boolean;
}

export interface ExportEtablissement {
  id: number;
  nomEtab: string;
  dren?: string;
  cisco?: string;
  zap?: string;
  commune?: string;
  fokontany?: string;
  quartier?: string;
  latitude?: number;
  longitude?: number;
  couvTelephonique: boolean;
  couvInternet: boolean;
  nbEnseignantG: number;
  nbEnseignantF: number;
  nbSectionG: number;
  nbSectionF: number;
  directeur?: ExportDirecteur | null;
  designations: ExportDesignation[];
  structures: ExportStructure[];
  photos: ExportPhoto[];
  batiments: ExportBatiment[];
  _count: {
    batiments: number;
    designations: number;
    structures: number;
    photos: number;
  };
}
