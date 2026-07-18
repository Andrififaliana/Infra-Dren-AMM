'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Database,
  Image as ImageIcon,
  BarChart3,
  UserCheck,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStatsGlobales } from '@/hooks/use-statistiques';
import { formatNumber } from '@/lib/utils';

const features = [
  {
    icon: Database, title: 'Base de données centralisée',
    desc: 'Toutes les informations sur les infrastructures scolaires de la région, accessibles en un clic.',
    color: 'bg-blue-50 text-blue-600', href: '/etablissements',
  },
  {
    icon: ImageIcon, title: 'Galerie photos',
    desc: 'Photographies des établissements pour un suivi visuel précis de l\'état des infrastructures.',
    color: 'bg-amber-50 text-amber-600', href: '/etablissements',
  },
  {
    icon: BarChart3, title: 'Statistiques & Rapports',
    desc: 'Tableaux de bord interactifs et indicateurs clés pour la prise de décision.',
    color: 'bg-green-50 text-green-600', href: '/statistiques',
  },
  {
    icon: UserCheck, title: 'Gestion administrateur',
    desc: 'Interface sécurisée pour la mise à jour et la maintenance des données.',
    color: 'bg-purple-50 text-purple-600', href: '/login',
  },
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

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Gestion des{' '}
              <span className="text-green-700">
                infrastructures scolaires
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Plateforme de suivi et de gestion des établissements scolaires de la
              Direction Régionale de l&apos;Éducation Nationale AMM.
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={() => router.push('/etablissements')}>
                Explorer les établissements <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {['Données sécurisées', 'Suivi en temps réel', 'Transparence'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />{item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="mx-auto max-w-7xl px-4 -mt-8 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Établissements', value: stats.totalEtablissements },
              { label: 'Bâtiments', value: stats.totalBatiments },
              { label: 'Salles de classe', value: stats.totalSalles },
              { label: 'Équipements', value: stats.totalEquipements },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{formatNumber(kpi.value)}</p>
              </div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Fonctionnalités de la plateforme</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Un outil complet pour la gestion et le suivi des infrastructures scolaires</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                onClick={() => router.push(feature.href)}
                className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:border-green-200/60 hover:shadow-md"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.color}`}><Icon className="h-6 w-6" /></div>
                <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Accéder à la section <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Comment ça fonctionne</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Un processus simple et transparent pour la gestion des données</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, idx) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-lg font-bold text-green-700">{step.num}</div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
