'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Search, List, LayoutGrid, Map, Users, MapPin,
  CheckCircle, Wrench, AlertTriangle, Building2, School,
  Image as ImageIcon, SearchX,
} from 'lucide-react';
import { useEtablissements } from '@/hooks/use-etablissements';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { EtablissementPhoto } from '@/components/etablissements/EtablissementPhoto';
import { formatNumber, getEtablissementStatus } from '@/lib/utils';
import type { EtablissementListe } from '@/types/etablissement';

const EtablissementsMap = dynamic(
  () => import('@/components/map/etablissements-map'),
  { ssr: false, loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl border bg-gray-50 text-sm text-gray-500">
      Chargement de la carte...
    </div>
  )}
);

const statusIcons = { success: CheckCircle, warning: Wrench, danger: AlertTriangle };

export default function EtablissementsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('gallery');
  const [filtreDren, setFiltreDren] = useState('');

  const { data, isLoading } = useEtablissements({ page, limit: 12, search: search || undefined, dren: filtreDren || undefined });
  const etablissements = data?.data ?? [];
  const meta = data?.meta;
  const drens = [...new Set(etablissements.map((e) => e.dren).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-2 h-10 w-1/3" /><Skeleton className="mb-8 h-5 w-1/2" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}><CardContent><Skeleton className="mb-3 h-40 w-full rounded-xl" /><Skeleton className="h-5 w-3/4" /><Skeleton className="mt-2 h-4 w-1/2" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Établissements scolaires</h1>
        <p className="mt-2 text-gray-600">{meta ? `${formatNumber(meta.total)} établissements` : ''} recensés dans la région AMM</p>
      </motion.div>

      <div className="mt-8 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher un établissement..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
          </div>
          <select value={filtreDren} onChange={(e) => { setFiltreDren(e.target.value); setPage(1); }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/20">
            <option value="">Tous districts</option>
            {drens.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-1">
          <button onClick={() => setViewMode('list')}
            className={`rounded-lg p-2 transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('gallery')}
            className={`rounded-lg p-2 transition-colors ${viewMode === 'gallery' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {etablissements.length === 0 ? (
        <EmptyState title="Aucun établissement trouvé" icon={<SearchX className="h-8 w-8" />} description={search ? 'Essayez de modifier votre recherche' : ''} />
      ) : viewMode === 'list' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {etablissements.map((etab, idx) => {
            const status = getEtablissementStatus(etab);
            const StatusIcon = statusIcons[status.variant];
            const mainPhoto = etab.photos?.find((p) => p.estPrincipale) ?? etab.photos?.[0] ?? null;
            return (
              <motion.div key={etab.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                <Card hover onClick={() => router.push(`/etablissements/${etab.id}`)} className="h-full">
                  <div className="mb-4 -mx-6 -mt-6 overflow-hidden rounded-t-2xl">
                    <EtablissementPhoto photo={mainPhoto} fixedHeight iconSize={16} className="w-full rounded-t-2xl" />
                  </div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{etab.nomEtab}</h3>
                      <p className="text-sm text-gray-500">{etab.dren || 'District non spécifié'}</p>
                    </div>
                    <Badge variant={status.variant} icon><StatusIcon className="h-3.5 w-3.5" />{status.label}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
                    <MapPin className="h-3.5 w-3.5" />{[etab.cisco, etab.commune].filter(Boolean).join(' - ') || 'Localisation non spécifiée'}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {formatNumber(etab._count?.batiments ?? 0)}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {formatNumber(etab.nbEnseignantG + etab.nbEnseignantF)} ens.</span>
                    {(etab._count?.photos ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-green-500"><ImageIcon className="h-3.5 w-3.5" /> {etab._count?.photos}</span>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {etablissements.map((etab) => {
            const mainPhoto = etab.photos?.find((p) => p.estPrincipale) ?? etab.photos?.[0] ?? null;
            return (
              <motion.div key={etab.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                onClick={() => router.push(`/etablissements/${etab.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-square">
                {mainPhoto ? (
                  <img src={mainPhoto.url} alt={etab.nomEtab} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-100 to-green-50">
                    <School className="h-20 w-20 text-green-300/60" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                  <p className="text-sm font-semibold text-white">{etab.nomEtab}</p>
                  <p className="text-xs text-white/70">{etab.dren || 'District'}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {meta && (
        <div className="mt-8">
          <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
