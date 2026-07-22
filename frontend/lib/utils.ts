import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { EtablissementListe } from '@/types/etablissement';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Calcule le statut d'un établissement basé sur ses indicateurs */
export function getEtablissementStatus(item: { _count?: { batiments?: number }; couvInternet?: boolean; couvTelephonique?: boolean }) {
  const batiments = item._count?.batiments ?? 0;
  if (batiments >= 2 && item.couvInternet && item.couvTelephonique) {
    return { label: 'Satisfaisant', variant: 'success' as const };
  }
  if (batiments >= 1) {
    return { label: 'À surveiller', variant: 'warning' as const };
  }
  return { label: 'Critique', variant: 'destructive' as const };
}
