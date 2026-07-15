'use client';

import {
  useStatsGlobales,
  useStatsParDren,
  useCouvertureReseau,
  useRepartitionSalles,
} from '@/hooks/use-statistiques';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { Badge } from '@/components/ui/badge';

export default function StatistiquesPage() {
  const { data: globales, isLoading: loadingGlobales } = useStatsGlobales();
  const { data: parDren, isLoading: loadingDren } = useStatsParDren();
  const { data: couverture } = useCouvertureReseau();
  const { data: repartition } = useRepartitionSalles();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="mt-2 text-gray-600">
          Aperçu global des infrastructures scolaires de la DREN AMM
        </p>
      </div>

      {/* Global Stats */}
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Indicateurs globaux</h2>
      {loadingGlobales ? (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : globales ? (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Établissements" value={globales.totalEtablissements} icon="🏫" />
          <StatCard title="Bâtiments" value={globales.totalBatiments} icon="🏗️" />
          <StatCard title="Salles" value={globales.totalSalles} icon="🚪" />
          <StatCard title="Équipements" value={globales.totalEquipements} icon="📦" />
          <StatCard
            title="Couverture téléphonique"
            value={`${globales.tauxCouvertureTelephonique}%`}
            icon="📞"
          />
          <StatCard
            title="Couverture Internet"
            value={`${globales.tauxCouvertureInternet}%`}
            icon="🌐"
          />
        </div>
      ) : null}

      {/* Stats by DREN */}
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Par DREN</h2>
      {loadingDren ? (
        <CardSkeleton />
      ) : parDren && parDren.length > 0 ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parDren.map((d) => (
            <Card key={d.dren}>
              <CardHeader>
                <CardTitle className="text-sm">{d.dren}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Établissements</span>
                    <span className="font-medium">{d.nbEtablissements}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bâtiments</span>
                    <span className="font-medium">{d.nbBatiments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Salles</span>
                    <span className="font-medium">{d.nbSalles}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Couverture réseau */}
        <Card>
          <CardHeader>
            <CardTitle>Couverture réseau</CardTitle>
          </CardHeader>
          <CardContent>
            {couverture && couverture.length > 0 ? (
              <div className="space-y-4">
                {couverture.map((c) => (
                  <div key={c.type}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium capitalize">{c.type === 'telephone' ? 'Téléphonique' : 'Internet'}</span>
                      <span className="text-gray-500">
                        {c.couvert}% couvert
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${c.couvert}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        {/* Répartition des salles */}
        <Card>
          <CardHeader>
            <CardTitle>État des salles</CardTitle>
          </CardHeader>
          <CardContent>
            {repartition && repartition.length > 0 ? (
              <div className="space-y-3">
                {repartition.map((r) => (
                  <div key={r.etat} className="flex items-center justify-between">
                    <Badge variant={r.etat === 'Bon' ? 'success' : r.etat === 'Moyen' ? 'warning' : 'danger'}>
                      {r.etat}
                    </Badge>
                    <span className="text-sm font-medium">{r.count} salle{r.count > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
