'use client';

import Link from 'next/link';
import { useStatsGlobales } from '@/hooks/use-statistiques';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/shared/loading-skeleton';

export default function HomePage() {
  const { data: stats, isLoading } = useStatsGlobales();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Infrastructures Scolaires
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              Plateforme de gestion et de suivi des établissements scolaires de la DREN AMM.
              Consultez les données, explorez les statistiques.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/etablissements">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Explorer les établissements
                </Button>
              </Link>
              <Link href="/statistiques">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Voir les statistiques
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">
          Aperçu global
        </h2>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : stats ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Établissements"
              value={stats.totalEtablissements}
              icon="🏫"
            />
            <StatCard
              title="Bâtiments"
              value={stats.totalBatiments}
              icon="🏗️"
            />
            <StatCard
              title="Salles de classe"
              value={stats.totalSalles}
              icon="🚪"
            />
            <StatCard
              title="Équipements"
              value={stats.totalEquipements}
              icon="📦"
            />
          </div>
        ) : null}
      </section>

      {/* Features Section */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl">
                🔍
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Consultation publique</h3>
              <p className="text-sm text-gray-600">
                Explorez la liste complète des établissements scolaires avec leurs informations détaillées.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-2xl">
                📊
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Statistiques</h3>
              <p className="text-sm text-gray-600">
                Visualisez les données clés : effectifs, couverture réseau, répartition des salles.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-2xl">
                🔒
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Gestion sécurisée</h3>
              <p className="text-sm text-gray-600">
                Interface d&apos;administration pour la gestion des données avec contrôle d&apos;accès.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
