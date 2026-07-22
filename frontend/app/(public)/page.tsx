'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Database, Image as ImageIcon, BarChart3, UserCheck, Map,
  ArrowRight, CheckCircle, TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStatsGlobales } from '@/hooks/use-statistiques';
import { useEtablissements } from '@/hooks/use-etablissements';
import { formatNumber } from '@/lib/utils';
import type { EtablissementListe } from '@/types/etablissement';

const EtablissementsMap = dynamic(
  () => import('@/components/map/etablissements-map'),
  { ssr: false, loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl border bg-muted text-sm text-muted-foreground">
      Chargement de la carte...
    </div>
  )}
);

const features = [
  { icon: Database, title: 'Base de données centralisée', desc: 'Toutes les informations sur les infrastructures scolaires de la région, accessibles en un clic.', color: 'bg-primary/5 text-primary', href: '/etablissements' },
  { icon: ImageIcon, title: 'Galerie photos', desc: 'Photographies des établissements pour un suivi visuel précis de l\'état des infrastructures.', color: 'bg-primary/10 text-primary/80', href: '/etablissements' },
  { icon: BarChart3, title: 'Statistiques & Rapports', desc: 'Tableaux de bord interactifs et indicateurs clés pour la prise de décision.', color: 'bg-primary/15 text-primary/70', href: '/statistiques' },
  { icon: UserCheck, title: 'Gestion administrateur', desc: 'Interface sécurisée pour la mise à jour et la maintenance des données.', color: 'bg-emerald-50 text-emerald-600', href: '/login' },
];

const steps = [
  { num: '01', title: 'Explorez', desc: 'Parcourez la liste des établissements' },
  { num: '02', title: 'Consultez', desc: 'Accédez aux fiches détaillées et photos' },
  { num: '03', title: 'Analysez', desc: 'Visualisez les statistiques globales' },
  { num: '04', title: 'Agissez', desc: 'Les administrateurs mettent à jour les données' },
];

export default function HomePage() {
  const router = useRouter();
  const { data: stats } = useStatsGlobales();
  const { data: etabData } = useEtablissements({ page: 1, limit: 999 });

  const etablissements = (etabData?.data ?? []) as EtablissementListe[];
  const schoolsWithCoords = useMemo(
    () => etablissements.filter(e => typeof e.latitude === 'number' && typeof e.longitude === 'number'),
    [etablissements]
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-32 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium">
              DREN Amoron&apos;i Mania
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Gestion des{' '}
              <span className="text-primary">infrastructures scolaires</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Plateforme de suivi et de gestion des établissements scolaires de la
              Direction Régionale de l&apos;Éducation Nationale AMM.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/etablissements')}>
                Explorer les établissements <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/statistiques')}>
                Voir les statistiques
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {['Données sécurisées', 'Suivi en temps réel', 'Transparence'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />{item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="mx-auto max-w-7xl px-4 -mt-8 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: 'Établissements', value: stats.totalEtablissements, icon: <Database className="h-5 w-5" /> },
              { label: 'Bâtiments', value: stats.totalBatiments, icon: <TrendingUp className="h-5 w-5" /> },
              { label: 'Salles de classe', value: stats.totalSalles, icon: <BarChart3 className="h-5 w-5" /> },
              { label: 'Équipements', value: stats.totalEquipements, icon: <ImageIcon className="h-5 w-5" /> },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    {kpi.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(kpi.value)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </section>
      )}

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">Fonctionnalités de la plateforme</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Un outil complet pour la gestion et le suivi des infrastructures scolaires</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                onClick={() => router.push(feature.href)}
                className="group cursor-pointer rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.color}`}><Icon className="h-6 w-6" /></div>
                <h3 className="mb-2 font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Accéder à la section <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-t">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">Comment ça fonctionne</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Un processus simple et transparent pour la gestion des données</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">{step.num}</div>
                <h3 className="font-semibold text-card-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <Map className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Carte interactive</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Visualisez l&apos;emplacement de tous les établissements scolaires de la région AMM.
                {schoolsWithCoords.length > 0 && (
                  <span> <strong>{schoolsWithCoords.length}</strong> établissements géolocalisés.</span>
                )}
              </p>
            </div>
            <div className="h-[500px] rounded-2xl overflow-hidden border">
              <EtablissementsMap
                schools={etablissements}
                showAleas={false} showTrajets={false}
                onSchoolClick={(id) => router.push(`/etablissements/${id}`)}
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
