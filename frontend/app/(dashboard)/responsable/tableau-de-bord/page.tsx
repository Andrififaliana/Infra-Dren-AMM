'use client';

import { useStatsGlobales, useStatsParDren, useCouvertureReseau, useRepartitionSalles } from '@/hooks/use-statistiques';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { formatNumber } from '@/lib/utils';
import { School, Building2, DoorOpen, Package, Phone, Globe } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#f97316', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6', '#14b8a6', '#eab308'];

export default function TableauDeBordPage() {
  const { data: globales, isLoading } = useStatsGlobales();
  const { data: parDren } = useStatsParDren();
  const { data: couverture } = useCouvertureReseau();
  const { data: repartition } = useRepartitionSalles();

  return (
    <div>
      <Breadcrumb items={[{ label: 'Tableau de bord' }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d&apos;ensemble des infrastructures scolaires
        </p>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : globales ? (
        <>
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Établissements" value={globales.totalEtablissements} icon={<School className="h-5 w-5" />} />
            <StatCard title="Bâtiments" value={globales.totalBatiments} icon={<Building2 className="h-5 w-5" />} />
            <StatCard title="Salles" value={globales.totalSalles} icon={<DoorOpen className="h-5 w-5" />} />
            <StatCard title="Équipements" value={globales.totalEquipements} icon={<Package className="h-5 w-5" />} />
          </div>

          {/* Graphiques */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Bar Chart - Répartition par DREN */}
            {parDren && parDren.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Établissements par district</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={parDren} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="dren" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                        />
                        <Bar dataKey="nbEtablissements" name="Établissements" fill="#f97316" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="nbSalles" name="Salles" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pie Chart - État des salles */}
            {repartition && repartition.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>État des salles de classe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={repartition}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="etat"
                          label={({ payload }: any) => `${payload.etat} (${payload.count})`}
                          labelLine={false}
                        >
                          {repartition.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                        />
                        <Legend verticalAlign="bottom" height={30} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Couverture réseau */}
            {couverture && couverture.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Couverture réseau</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {couverture.map((c) => (
                    <div key={c.type}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">
                          <span className="inline-flex items-center gap-1.5">{c.type === 'telephone' ? <><Phone className="h-4 w-4" /> Couverture téléphonique</> : <><Globe className="h-4 w-4" /> Couverture Internet</>}</span>
                        </span>
                        <span className="font-semibold text-gray-900">{c.couvert}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-100">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000"
                          style={{ width: `${c.couvert}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tableau DREN */}
          {parDren && parDren.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Répartition détaillée par district</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-medium text-gray-500">District</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">Établissements</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">Bâtiments</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">Salles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parDren.map((d) => (
                        <tr key={d.dren} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium">{d.dren}</td>
                          <td className="px-4 py-3 text-right">{formatNumber(d.nbEtablissements)}</td>
                          <td className="px-4 py-3 text-right">{formatNumber(d.nbBatiments)}</td>
                          <td className="px-4 py-3 text-right">{formatNumber(d.nbSalles)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
