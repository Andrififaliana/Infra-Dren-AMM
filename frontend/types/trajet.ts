export interface Moyens {
  idMoyen: number;
  typeMoyen?: string;
  dureeMoyen?: number;
  distanceMoyen?: number;
}

export interface PeriodeDifficile {
  idPeriode: number;
  debutPeriode: string;
  finPeriode: string;
}

export interface Trajet {
  idTrajet: number;
  debutTrajet?: string;
  finTrajet?: string;
  nomTrajet?: string;
  moyensId: number;
  periodeId?: number;
  moyens?: Moyens;
  periode?: PeriodeDifficile;
}

export interface CreateTrajetDto {
  nomTrajet?: string;
  debutTrajet?: string;
  finTrajet?: string;
  moyensData?: {
    typeMoyen?: string;
    dureeMoyen?: number;
    distanceMoyen?: number;
  };
  periodeData?: {
    debutPeriode: string;
    finPeriode: string;
  };
}

export interface UpdateTrajetDto extends Partial<CreateTrajetDto> {}
