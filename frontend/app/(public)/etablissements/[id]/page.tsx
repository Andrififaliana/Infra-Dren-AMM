'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft, MapPin, Users, Phone, Mail,
  Building2, DoorOpen, Droplets, Wifi, School,
} from 'lucide-react';
import { useEtablissement } from '@/hooks/use-etablissements';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !etab) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <School className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Établissement non trouvé</p>
        <Button onClick={() => router.push('/etablissements')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
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
          <div className="relative overflow-hidden rounded-3xl border">
            {photos.length > 0 ? (
              <PhotoGallery photos={photos} />
            ) : (
              <EtablissementPhoto photo={null} iconSize={24} className="aspect-[16/10] rounded-3xl" />
            )}
            <div className="absolute top-4 left-4">
              <Badge variant={status.variant} icon={<span className="h-2 w-2 rounded-full bg-current" />}>{status.label}</Badge>
            </div>
          </div>

          {/* Identity overlay */}
          <div className="relative -mt-16 z-10 mx-4 p-4 rounded-2xl bg-background/95 backdrop-blur-sm border shadow-sm">
            <h2 className="text-xl font-bold text-foreground">{etab.nomEtab}</h2>
            <p className="text-sm text-muted-foreground">{etab.dren} - {etab.cisco}</p>
          </div>

          {/* Coordonnées */}
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-sm">Coordonnées</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {etab.directeur && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0 text-primary" />
                    <span>{etab.directeur.nomDirecteur} {etab.directeur.prenomDr || ''}</span>
                  </div>
                  {etab.directeur.emailDr &&
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0 text-primary" />
                      <span>{etab.directeur.emailDr}</span>
                    </div>
                  }
                  {etab.directeur.telDr &&
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0 text-primary" />
                      <span>{etab.directeur.telDr}</span>
                    </div>
                  }
                </>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>{[etab.commune, etab.fokontany, etab.quartier].filter(Boolean).join(', ') || 'Non renseigné'}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right - Data */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
          {/* Données clés */}
          <Card>
            <CardHeader><CardTitle>Données clés</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Enseignants', value: formatNumber(etab.nbEnseignantG + etab.nbEnseignantF) },
                  { label: 'Sections', value: formatNumber(etab.nbSectionG + etab.nbSectionF) },
                  { label: 'Salles', value: formatNumber(totalSalles) },
                ].map((d) => (
                  <div key={d.label} className="rounded-xl bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{d.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{d.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructures */}
          <Card>
            <CardHeader><CardTitle>Infrastructures</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 text-primary" />Bâtiments
                </span>
                <span className="font-semibold text-foreground">{formatNumber(etab._count?.batiments ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DoorOpen className="h-4 w-4 text-primary" />Désignations
                </span>
                <span className="font-semibold text-foreground">{formatNumber(etab._count?.designations ?? 0)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wifi className="h-4 w-4 text-primary" />Internet
                </span>
                <Badge variant={etab.couvInternet ? 'success' : 'destructive'}>
                  {etab.couvInternet ? 'Disponible' : 'Non disponible'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Droplets className="h-4 w-4 text-primary" />Téléphone
                </span>
                <Badge variant={etab.couvTelephonique ? 'success' : 'destructive'}>
                  {etab.couvTelephonique ? 'Disponible' : 'Non disponible'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Bâtiments */}
          {etab.batiments && etab.batiments.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Bâtiments ({etab.batiments.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {etab.batiments.map((bat: any) => (
                  <div key={bat.idBat} className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/80">
                    <div>
                      <p className="font-medium text-foreground">{bat.sigleBat || `Bâtiment #${bat.idBat}`}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {bat.nbNiveau} niveau{bat.nbNiveau > 1 ? 'x' : ''} · {bat.salles?.length ?? 0} salle{bat.salles?.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant={bat.salles?.some((s: any) => s.estOperationnel) ? 'success' : 'destructive'}>
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
