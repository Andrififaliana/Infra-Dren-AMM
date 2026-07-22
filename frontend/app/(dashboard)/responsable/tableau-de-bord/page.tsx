'use client';

import { motion } from 'motion/react';
import { useStatsGlobales, useStatsParDren, useCouvertureReseau, useRepartitionSalles } from '@/hooks/use-statistiques';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { formatNumber } from '@/lib/utils';
import { School, Building2, DoorOpen, Package, Phone, Globe, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#15803d', '#166534', '#14532d'];

export default function TableauDeBordPage() {
  const { data: globales, isLoading } = useStatsGlobales();
  const { data: parDren } = useStatsParDren();
  const { data: couverture } = useCouvertureReseau();
  const { data: repartition } = useRepartitionSalles();

  return (
    <div>
      <Breadcrumb items={[{ label: 'Tableau de bord' }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d&apos;ensemble des infrastructures scolaires
        </p>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : globales ? (
        <>
          <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard title="Établissements" value={globales.totalEtablissements} icon={<School className="h-5 w-5" />} index={0} />
            <StatCard title="Bâtiments" value={globales.totalBatiments} icon={<Building2 className="h-5 w-5" />} index={1} />
            <StatCard title="Salles" value={globales.totalSalles} icon={<DoorOpen className="h-5 w-5" />} index={2} />
            <StatCard title="Équipements" value={globales.totalEquipements} icon={<Package className="h-5 w-5" />} index={3} />
          </div>

          {/* Graphiques */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Bar Chart */}
            {parDren && parDren.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Établissements par district
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={parDren} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="dren" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--background))' }} />
                          <Bar dataKey="nbEtablissements" name="Établissements" fill="hsl(142.1 76.2% 36.3%)" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="nbSalles" name="Salles" fill="hsl(142.1 60% 50%)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Pie Chart */}
            {repartition && repartition.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <PieChart className="h-5 w-5 text-primary" />
                      État des salles de classe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={repartition}
                            cx="50%" cy="45%"
                            innerRadius={60} outerRadius={95}
                            paddingAngle={3}
                            dataKey="count" nameKey="etat"
                            label={({ payload }: any) => `${payload.etat} (${payload.count})`}
                            labelLine={false}
                          >
                            {repartition.map((_, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--background))' }} />
                          <Legend verticalAlign="bottom" height={30} />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Couverture réseau */}
            {couverture && couverture.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Signal className="h-5 w-5 text-primary" />
                      Couverture réseau
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {couverture.map((c) => (
                      <div key={c.type}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium text-foreground">
                            {c.type === 'telephone' ? <Phone className="h-4 w-4 text-primary" /> : <Globe className="h-4 w-4 text-primary" />}
                            {c.type === 'telephone' ? 'Couverture téléphonique' : 'Couverture Internet'}
                          </span>
                          <span className="font-semibold text-foreground">{c.couvert}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${c.couvert}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-3 rounded-full bg-gradient-to-r from-primary/60 to-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Tableau DREN */}
          {parDren && parDren.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Répartition détaillée par district
                </CardTitle>
              </CardHeader>
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
                          <td className="px-4 py-3 text-right tabular-nums text-foreground">{formatNumber(d.nbEtablissements)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-foreground">{formatNumber(d.nbBatiments)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-foreground">{formatNumber(d.nbSalles)}</td>
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
