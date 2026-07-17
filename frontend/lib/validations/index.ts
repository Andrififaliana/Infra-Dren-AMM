import { z } from 'zod';

// Ré-exporte tout depuis le fichier existant
export {
  etablissementSchema,
  loginSchema,
  userSchema,
  batimentSchema,
  salleSchema,
} from './etablissement';

export type {
  EtablissementFormData,
  LoginFormData,
  UserFormData,
  BatimentFormData,
  SalleFormData,
} from './etablissement';

// Nouveaux schémas manquants
export const equipementSchema = z.object({
  nomEquip: z.string().min(1, "Le nom de l'équipement est requis"),
  typeEquip: z.string().optional(),
  etat: z.string().optional(),
  quantite: z.coerce.number().min(0, 'La quantité doit être positive').optional(),
  salleId: z.coerce.number({ message: 'La salle est requise' }),
});

export const trajetSchema = z.object({
  nomTrajet: z.string().optional(),
  debutTrajet: z.string().optional(),
  finTrajet: z.string().optional(),
  moyensData: z.object({
    typeMoyen: z.string().optional(),
    dureeMoyen: z.coerce.number().min(0).optional(),
    distanceMoyen: z.coerce.number().min(0).optional(),
  }).optional(),
  periodeData: z.object({
    debutPeriode: z.string().optional(),
    finPeriode: z.string().optional(),
  }).optional(),
});

export const aleaSchema = z.object({
  typeAleat: z.string().optional(),
  nomAleat: z.string().optional(),
  dateAleat: z.string().optional(),
  explication: z.string().optional(),
});

export type EquipementFormData = z.infer<typeof equipementSchema>;
export type TrajetFormData = z.infer<typeof trajetSchema>;
export type AleaFormData = z.infer<typeof aleaSchema>;
