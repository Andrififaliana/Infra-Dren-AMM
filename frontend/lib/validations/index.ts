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
  salleId: z.coerce.number({ message: 'La salle est requise' }).refine((n) => n > 0, 'Veuillez sélectionner une salle'),
});

export const trajetSchema = z.object({
  nomTrajet: z.string().min(1, 'Le nom du trajet est requis'),
  debutTrajet: z.string().min(1, 'La date de début est requise'),
  finTrajet: z.string().min(1, 'La date de fin est requise'),
  moyensData: z.object({
    typeMoyen: z.string().min(1, 'Le type de moyen est requis'),
    dureeMoyen: z.coerce.number().min(0, 'La durée doit être positive').optional(),
    distanceMoyen: z.coerce.number().min(0, 'La distance doit être positive').optional(),
  }),
  periodeData: z.object({
    debutPeriode: z.string().optional(),
    finPeriode: z.string().optional(),
  }).optional(),
});

export const aleaSchema = z.object({
  nomAleat: z.string().min(1, "Le nom de l'aléa est requis"),
  typeAleat: z.string().min(1, 'Le type est requis'),
  dateAleat: z.string().min(1, 'La date est requise'),
  explication: z.string().optional(),
});

export type EquipementFormData = z.infer<typeof equipementSchema>;
export type TrajetFormData = z.infer<typeof trajetSchema>;
export type AleaFormData = z.infer<typeof aleaSchema>;
