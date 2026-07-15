'use client';

import { useStatsGlobales, useStatsParDren } from '@/hooks/use-statistiques';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/shared/loading-skeleton';

export default function TableauDeBordPage() {
  const { data: globales, isLoading } = useStatsGlobales();
  const { data: parDren } = useStatsParDren();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d&apos;ensemble des infrastructures scolaires
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : globales ? (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Établissements" value={globales.totalEtablissements} icon="🏫" />
          <StatCard title="Bâtiments" value={globales.totalBatiments} icon="🏗️" />
          <StatCard title="Salles" value={globales.totalSalles} icon="🚪" />
          <StatCard title="Équipements" value={globales.totalEquipements} icon="📦" />
        </div>
      ) : null}

      {parDren && parDren.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition par DREN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">DREN</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Établissements</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Bâtiments</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Salles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parDren.map((d) => (
                    <tr key={d.dren} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{d.dren}</td>
                      <td className="px-4 py-3 text-right">{d.nbEtablissements}</td>
                      <td className="px-4 py-3 text-right">{d.nbBatiments}</td>
                      <td className="px-4 py-3 text-right">{d.nbSalles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
