import type { Alea } from './alea';
import type { Trajet } from './trajet';

export interface Directeur {
  idDirecteur: number;
  nomDirecteur: string;
  prenomDr?: string;
  emailDr?: string;
  telDr?: string;
  etablissementId?: number;
}

export interface Designation {
  idDesign: number;
  nomDesign: string;
  estEnceinteEtab: boolean;
  estTitre: boolean;
  typeDesignation?: string;
  numCadastre?: string;
  superficieDesign?: number;
  estLitigieux: boolean;
  etablissementId: number;
}

export interface Structure {
  idStruc: number;
  typeStruc?: string;
  existenceStruc: boolean;
  materiauxStruc?: string;
  etatStruc?: string;
  etablissementId: number;
}

export interface BatimentSummary {
  idBat: number;
  sigleBat?: string;
  nbNiveau: number;
  _count?: { salles: number; toilettes: number };
}

/** Photo d'établissement uploadée via R2 */
export interface Photo {
  id: number;
  key: string;
  url: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  estPrincipale: boolean;
  etablissementId: number;
  createdAt: string;
}

export interface EtablissementAlea {
  etablissementId: number;
  aleaId: number;
  alea: Alea;
}

export interface EtablissementTrajet {
  etablissementId: number;
  trajetId: number;
  trajet: Trajet;
}

export interface Etablissement {
  id: number;
  nomEtab: string;
  dren?: string;
  cisco?: string;
  zap?: string;
  commune?: string;
  latitude?: number;
  longitude?: number;
  fokontany?: string;
  quartier?: string;
  couvTelephonique: boolean;
  couvInternet: boolean;
  nbEnseignantG: number;
  nbEnseignantF: number;
  nbSectionG: number;
  nbSectionF: number;
  directeur?: Directeur;
  designations?: Designation[];
  structures?: Structure[];
  batiments?: BatimentSummary[];
  photos?: Photo[];
  aleas?: EtablissementAlea[];
  trajets?: EtablissementTrajet[];
  _count?: {
    batiments: number;
    designations: number;
    structures: number;
    photos?: number;
  };
}

/** Version simplifiée pour la liste (inclut la photo principale) */
export interface EtablissementListe extends Omit<Etablissement, 'directeur' | 'designations' | 'structures' | 'batiments'> {
  photos?: Photo[];
  _count: {
    batiments: number;
    designations: number;
    structures: number;
    photos?: number;
  };
}

export interface CreateEtablissementDto {
  nomEtab: string;
  dren?: string;
  cisco?: string;
  zap?: string;
  latitude?: number;
  longitude?: number;
  commune?: string;
  fokontany?: string;
  quartier?: string;
  couvTelephonique?: boolean;
  couvInternet?: boolean;
  nbEnseignantG?: number;
  nbEnseignantF?: number;
  nbSectionG?: number;
  nbSectionF?: number;
}

export interface UpdateEtablissementDto extends Partial<CreateEtablissementDto> {}

export interface EtablissementWithCoords extends EtablissementListe {
  latitude?: number;
  longitude?: number;
}

export interface EtablissementQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  dren?: string;
  cisco?: string;
  zap?: string;
  commune?: string;
}
