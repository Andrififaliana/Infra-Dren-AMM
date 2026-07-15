export interface Equipement {
  id: number;
  nomEquip: string;
  typeEquip?: string;
  etat?: string;
  quantite: number;
  salleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface EquipementSummary {
  id: number;
  nomEquip: string;
  typeEquip?: string;
  etat?: string;
  quantite: number;
}

export interface CreateEquipementDto {
  nomEquip: string;
  typeEquip?: string;
  etat?: string;
  quantite?: number;
  salleId: number;
}

export interface UpdateEquipementDto extends Partial<CreateEquipementDto> {}
