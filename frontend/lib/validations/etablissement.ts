import { z } from 'zod';

export const etablissementSchema = z.object({
  nomEtab: z.string().min(1, 'Le nom est requis'),
  dren: z.string().optional(),
  cisco: z.string().optional(),
  commune: z.string().optional(),
  fokontany: z.string().optional(),
  quartier: z.string().optional(),
  couvTelephonique: z.boolean().optional(),
  couvInternet: z.boolean().optional(),
  nbEnseignantG: z.coerce.number().min(0).optional(),
  nbEnseignantF: z.coerce.number().min(0).optional(),
  nbSectionG: z.coerce.number().min(0).optional(),
  nbSectionF: z.coerce.number().min(0).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

export const userSchema = z.object({
  email: z.string().email('Email invalide'),
  nom: z.string().min(1, 'Le nom est requis'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  role: z.enum(['ADMIN', 'RESPONSABLE_INFRASTRUCTURE']),
});

export const batimentSchema = z.object({
  sigleBat: z.string().optional(),
  nbNiveau: z.coerce.number().min(0).optional(),
  etablissementId: z.coerce.number(),
});

export const salleSchema = z.object({
  sigleSalle: z.string().optional(),
  niveauSalle: z.coerce.number().min(0),
  batimentId: z.coerce.number(),
  affectationSalle: z.string().optional(),
  etatSalle: z.string().optional(),
  estOperationnel: z.boolean().optional(),
  estElectrifiee: z.boolean().optional(),
});

export type EtablissementFormData = z.infer<typeof etablissementSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type BatimentFormData = z.infer<typeof batimentSchema>;
export type SalleFormData = z.infer<typeof salleSchema>;
