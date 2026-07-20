export interface SalleSummary {
  idSalle: number;
  sigleSalle?: string;
  niveauSalle: number;
  affectationSalle?: string;
  estOperationnel: boolean;
  nbEleveF: number;
  nbEleveG: number;
  _count?: { equipements: number; ouvertures: number };
}

export interface BatimentPhoto {
  id: number;
  key: string;
  url: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  estPrincipale: boolean;
  batimentId: number;
  createdAt: string;
}

export interface Batiment {
  idBat: number;
  sigleBat?: string;
  nbNiveau: number;
  anneeRecProvC?: string;
  anneeDefC?: string;
  srcFic?: string;
  agenceC?: string;
  anneeR?: string;
  srcFir?: string;
  agenceR?: string;
  dispositifAc?: string;
  etablissementId: number;
  salles?: SalleSummary[];
  toilettes?: Toilette[];
  photos?: BatimentPhoto[];
}

export interface BatimentSummary {
  idBat: number;
  sigleBat?: string;
  nbNiveau: number;
  _count?: { salles: number; toilettes: number };
}

export interface Toilette {
  idToilette: number;
  nbCompartiment: number;
  fonctionToilette?: string;
  pointEau: boolean;
  batimentId: number;
}

export interface CreateBatimentDto {
  sigleBat?: string;
  nbNiveau?: number;
  etablissementId: number;
  anneeRecProvC?: string;
  anneeDefC?: string;
  srcFic?: string;
  agenceC?: string;
  anneeR?: string;
  srcFir?: string;
  agenceR?: string;
  dispositifAc?: string;
}

export interface UpdateBatimentDto extends Partial<CreateBatimentDto> {}
