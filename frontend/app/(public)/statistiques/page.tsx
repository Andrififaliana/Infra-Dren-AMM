'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wifi, Signal, School,
  Building2, DoorOpen, TrendingUp,
} from 'lucide-react';
import {
  useStatsGlobales, useStatsParDren, useCouvertureReseau, useRepartitionSalles,
} from '@/hooks/use-statistiques';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { formatNumber } from '@/lib/utils';

export default function StatistiquesPage() {
  const [filtreDren, setFiltreDren] = useState('');
  const { data: globales, isLoading: loadingG } = useStatsGlobales();
  const { data: parDren } = useStatsParDren();
  const { data: couverture } = useCouvertureReseau();
  const { data: repartition } = useRepartitionSalles();

  const drens = parDren?.map(d => d.dren) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Statistiques</h1>
        <p className="mt-2 text-muted-foreground">Aperçu global des infrastructures scolaires de la région AMM</p>
      </motion.div>

      {/* Filter */}
      <div className="mt-6 mb-8">
        <select
          value={filtreDren}
          onChange={(e) => setFiltreDren(e.target.value)}
          className="w-full sm:w-auto flex h-10 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Tous les districts</option>
          {drens.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* KPIs */}
      {loadingG ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : globales ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4"
        >
          {[
            { icon: School, label: 'Établissements', value: globales.totalEtablissements, color: 'bg-primary/5 text-primary' },
            { icon: Building2, label: 'Bâtiments', value: globales.totalBatiments, color: 'bg-primary/10 text-primary/80' },
            { icon: DoorOpen, label: 'Salles de classe', value: globales.totalSalles, color: 'bg-primary/15 text-primary/70' },
            { icon: TrendingUp, label: 'Équipements', value: globales.totalEquipements, color: 'bg-emerald-50 text-emerald-600' },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl p-3 ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(kpi.value)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Couverture réseau */}
        <Card>
          <CardHeader><CardTitle>Couverture réseau</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {couverture && couverture.length > 0 ? couverture.map((c) => (
              <div key={c.type}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {c.type === 'telephone' ? <Signal className="h-4 w-4 text-primary" /> : <Wifi className="h-4 w-4 text-primary" />}
                    {c.type === 'telephone' ? 'Couverture téléphonique' : 'Couverture Internet'}
                  </span>
                  <span className="font-semibold text-foreground">{c.couvert}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.couvert}%` }}
                    viewport={{ once: true }}
                    className="h-2.5 rounded-full bg-gradient-to-r from-primary/60 to-primary"
                  />
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">Aucune donnée</p>}
          </CardContent>
        </Card>

        {/* État des salles */}
        <Card>
          <CardHeader><CardTitle>État des salles</CardTitle></CardHeader>
          <CardContent>
            {repartition && repartition.length > 0 ? (
              <div className="space-y-4">
                {repartition.map((r) => (
                  <div key={r.etat} className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                    <Badge variant={r.etat === 'Bon' ? 'success' : r.etat === 'Moyen' ? 'warning' : 'destructive'}>
                      {r.etat}
                    </Badge>
                    <span className="font-semibold text-foreground">{r.count} salle{r.count > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Aucune donnée</p>}
          </CardContent>
        </Card>

        {/* Répartition par DREN */}
        {parDren && parDren.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Répartition par district</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">District</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Établissements</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Bâtiments</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Salles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parDren.map((d) => (
                      <tr key={d.dren} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{d.dren}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{d.nbEtablissements}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{d.nbBatiments}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{d.nbSalles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
