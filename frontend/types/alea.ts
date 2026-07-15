export interface EffetAleat {
  aleaId: number;
  trajetId: number;
  nbElevesG: number;
  nbElevesF: number;
  nbEnseignG: number;
  nbEnseignF: number;
  trajet?: { idTrajet: number; nomTrajet?: string };
}

export interface Alea {
  idAleat: number;
  typeAleat?: string;
  nomAleat?: string;
  dateAleat?: string;
  explication?: string;
  effets?: EffetAleat[];
}

export interface CreateAleaDto {
  typeAleat?: string;
  nomAleat?: string;
  dateAleat?: string;
  explication?: string;
  effets?: {
    trajetId?: number;
    nbElevesG?: number;
    nbElevesF?: number;
    nbEnseignG?: number;
    nbEnseignF?: number;
  }[];
}

export interface UpdateAleaDto extends Partial<CreateAleaDto> {}
