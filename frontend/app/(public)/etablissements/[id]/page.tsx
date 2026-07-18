'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft, MapPin, Users, Phone, Mail,
  Building2, DoorOpen, Droplets, Wifi,
} from 'lucide-react';
import { useEtablissement } from '@/hooks/use-etablissements';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EtablissementPhoto, PhotoGallery } from '@/components/etablissements/EtablissementPhoto';
import { formatNumber, getEtablissementStatus } from '@/lib/utils';

export default function EtablissementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: etab, isLoading, error } = useEtablissement(Number(id));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-10 w-1/3" />
        <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-96 rounded-3xl" /><Skeleton className="h-96 rounded-3xl" /></div>
      </div>
    );
  }

  if (error || !etab) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-gray-500">Établissement non trouvé</p>
        <Button onClick={() => router.push('/etablissements')} className="mt-4">Retour</Button>
      </div>
    );
  }

  const status = getEtablissementStatus(etab);
  const totalSalles = etab.batiments?.reduce((acc: number, b: any) => acc + (b.salles?.length ?? 0), 0) ?? 0;
  const photos = etab.photos ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" onClick={() => router.push('/etablissements')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left - Photos & Identity */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-2/5">
          {/* Photo principale + galerie */}
          <div className="relative overflow-hidden rounded-3xl">
            {photos.length > 0 ? (
              <PhotoGallery photos={photos} />
            ) : (
              <EtablissementPhoto photo={null} iconSize={24} className="aspect-[16/10] rounded-3xl" />
            )}
            {/* Status badge overlay */}
            <div className="absolute top-4 left-4">
              <Badge variant={status.variant} icon>{status.label}</Badge>
            </div>
          </div>

          {/* Info card */}
          <div className="mt-4 rounded-3xl bg-gradient-to-t from-black/60 to-transparent -mt-16 relative z-10 p-6 pt-12">
            <h2 className="text-xl font-bold text-white">{etab.nomEtab}</h2>
            <p className="text-sm text-white/80">{etab.dren} - {etab.cisco}</p>
          </div>

          {/* Coordonnées */}
          <Card className="mt-2">
            <CardHeader><CardTitle className="text-sm">Coordonnées</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {etab.directeur && (
                <>
                  <div className="flex items-center gap-2 text-gray-600"><Users className="h-4 w-4 text-green-500" />{etab.directeur.nomDirecteur} {etab.directeur.prenomDr || ''}</div>
                  {etab.directeur.emailDr && <div className="flex items-center gap-2 text-gray-600"><Mail className="h-4 w-4 text-green-500" />{etab.directeur.emailDr}</div>}
                  {etab.directeur.telDr && <div className="flex items-center gap-2 text-gray-600"><Phone className="h-4 w-4 text-green-500" />{etab.directeur.telDr}</div>}
                </>
              )}
              <div className="flex items-center gap-2 text-gray-600"><MapPin className="h-4 w-4 text-green-500" />{[etab.commune, etab.fokontany, etab.quartier].filter(Boolean).join(', ') || 'Non renseigné'}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right - Data */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Données clés</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Enseignants', value: formatNumber(etab.nbEnseignantG + etab.nbEnseignantF) },
                  { label: 'Sections', value: formatNumber(etab.nbSectionG + etab.nbSectionF) },
                  { label: 'Salles', value: formatNumber(totalSalles) },
                ].map((d) => (
                  <div key={d.label} className="rounded-xl bg-gray-50 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{d.value}</p>
                    <p className="text-xs text-gray-500">{d.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Infrastructures</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-green-500" />Bâtiments</span>
                <span className="font-semibold">{formatNumber(etab._count?.batiments ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><DoorOpen className="h-4 w-4 text-green-500" />Désignations</span>
                <span className="font-semibold">{formatNumber(etab._count?.designations ?? 0)}</span>
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Wifi className="h-4 w-4 text-green-500" />Internet</span>
                  <Badge variant={etab.couvInternet ? 'success' : 'danger'}>{etab.couvInternet ? 'Disponible' : 'Non disponible'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm"><Droplets className="h-4 w-4 text-green-500" />Téléphone</span>
                  <Badge variant={etab.couvTelephonique ? 'success' : 'danger'}>{etab.couvTelephonique ? 'Disponible' : 'Non disponible'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          {etab.batiments && etab.batiments.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Bâtiments ({etab.batiments.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {etab.batiments.map((bat: any) => (
                  <div key={bat.idBat} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <div>
                      <p className="font-medium text-gray-900">{bat.sigleBat || `Bâtiment #${bat.idBat}`}</p>
                      <p className="text-xs text-gray-500">{bat.nbNiveau} niveau{bat.nbNiveau > 1 ? 'x' : ''} • {bat.salles?.length ?? 0} salle{bat.salles?.length > 1 ? 's' : ''}</p>
                    </div>
                    <Badge variant={bat.salles?.some((s: any) => s.estOperationnel) ? 'success' : 'warning'}>
                      {bat.salles?.some((s: any) => s.estOperationnel) ? 'Opérationnel' : 'Non opérationnel'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
