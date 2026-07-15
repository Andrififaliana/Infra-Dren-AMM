'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEtablissement } from '@/hooks/use-etablissements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';

export default function EtablissementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: etablissement, isLoading, error } = useEtablissement(Number(id));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-8 w-1/2" />
        <Skeleton className="mb-8 h-4 w-1/3" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !etablissement) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-gray-500">Établissement non trouvé</p>
        <Button onClick={() => router.push('/etablissements')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" onClick={() => router.push('/etablissements')} className="mb-4">
        ← Retour
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{etablissement.nomEtab}</h1>
        <p className="mt-2 text-gray-600">
          {[etablissement.dren, etablissement.cisco, etablissement.commune, etablissement.fokontany, etablissement.quartier]
            .filter(Boolean)
            .join(' - ')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">DREN</dt>
                <dd className="font-medium">{etablissement.dren || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">CISCO</dt>
                <dd className="font-medium">{etablissement.cisco || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Commune</dt>
                <dd className="font-medium">{etablissement.commune || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fokontany</dt>
                <dd className="font-medium">{etablissement.fokontany || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Quartier</dt>
                <dd className="font-medium">{etablissement.quartier || '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Couverture et effectifs */}
        <Card>
          <CardHeader>
            <CardTitle>Couverture & Effectifs</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Couverture téléphonique</dt>
                <dd>
                  <Badge variant={etablissement.couvTelephonique ? 'success' : 'danger'}>
                    {etablissement.couvTelephonique ? 'Oui' : 'Non'}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Couverture Internet</dt>
                <dd>
                  <Badge variant={etablissement.couvInternet ? 'success' : 'danger'}>
                    {etablissement.couvInternet ? 'Oui' : 'Non'}
                  </Badge>
                </dd>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Enseignants (H)</dt>
                  <dd className="font-medium">{formatNumber(etablissement.nbEnseignantG)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Enseignants (F)</dt>
                  <dd className="font-medium">{formatNumber(etablissement.nbEnseignantF)}</dd>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Sections (H)</dt>
                  <dd className="font-medium">{formatNumber(etablissement.nbSectionG)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Sections (F)</dt>
                  <dd className="font-medium">{formatNumber(etablissement.nbSectionF)}</dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Directeur */}
        {etablissement.directeur && (
          <Card>
            <CardHeader>
              <CardTitle>Directeur</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Nom</dt>
                  <dd className="font-medium">{etablissement.directeur.nomDirecteur}</dd>
                </div>
                {etablissement.directeur.prenomDr && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Prénom</dt>
                    <dd className="font-medium">{etablissement.directeur.prenomDr}</dd>
                  </div>
                )}
                {etablissement.directeur.emailDr && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Email</dt>
                    <dd className="font-medium">{etablissement.directeur.emailDr}</dd>
                  </div>
                )}
                {etablissement.directeur.telDr && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Téléphone</dt>
                    <dd className="font-medium">{etablissement.directeur.telDr}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Bâtiments */}
        {etablissement.batiments && etablissement.batiments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bâtiments ({etablissement.batiments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {etablissement.batiments.map((bat) => (
                  <div key={bat.idBat} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{bat.sigleBat || `Bâtiment #${bat.idBat}`}</span>
                      <span className="text-sm text-gray-500">{bat.nbNiveau} niveau{bat.nbNiveau > 1 ? 'x' : ''}</span>
                    </div>
                    {bat._count && (
                      <div className="mt-1 flex gap-3 text-xs text-gray-500">
                        <span>{bat._count.salles} salle{bat._count.salles > 1 ? 's' : ''}</span>
                        <span>{bat._count.toilettes} toilette{bat._count.toilettes > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
