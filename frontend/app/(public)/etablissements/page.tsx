'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Search, List, LayoutGrid, Map, Users, MapPin,
  CheckCircle, Wrench, AlertTriangle, Building2, School,
  Image as ImageIcon,  SearchX,
} from 'lucide-react';
import { useEtablissements } from '@/hooks/use-etablissements';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { EtablissementPhoto } from '@/components/etablissements/EtablissementPhoto';
import { formatNumber, getEtablissementStatus } from '@/lib/utils';
import type { EtablissementListe } from '@/types/etablissement';

const EtablissementsMap = dynamic(
  () => import('@/components/map/etablissements-map'),
  { ssr: false, loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl border bg-muted text-sm text-muted-foreground">
      Chargement de la carte...
    </div>
  )}
);

const statusIcons = { success: CheckCircle, warning: Wrench, destructive: AlertTriangle };

export default function EtablissementsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'gallery' | 'map'>('gallery');
  const [filtreDren, setFiltreDren] = useState('');
  const [filtreCisco, setFiltreCisco] = useState('');
  const [filtreZap, setFiltreZap] = useState('');

  const { data, isLoading } = useEtablissements({ page, limit: 12, search: search || undefined, dren: filtreDren || undefined, cisco: filtreCisco || undefined, zap: filtreZap || undefined });
  const { data: allData } = useEtablissements({ page: 1, limit: 999 }, { enabled: viewMode === 'map' });

  const etablissements = data?.data ?? [];
  const allEtablissements = (allData?.data ?? []) as EtablissementListe[];
  const meta = data?.meta;
  const drens = useMemo(() => [...new Set(etablissements.map(e => e.dren).filter(Boolean) as string[])], [etablissements]);
  const ciscos = useMemo(() => [...new Set(etablissements.map(e => e.cisco).filter(Boolean) as string[])], [etablissements]);
  const zaps = useMemo(() => {
    const filtered = filtreCisco ? etablissements.filter(e => e.cisco === filtreCisco) : etablissements;
    return [...new Set(filtered.map(e => e.zap).filter(Boolean))];
  }, [etablissements, filtreCisco]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-2 h-10 w-1/3" />
        <Skeleton className="mb-8 h-5 w-1/2" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="mb-3 h-40 w-full rounded-xl" /><Skeleton className="h-5 w-3/4" /><Skeleton className="mt-2 h-4 w-1/2" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Établissements scolaires</h1>
        <p className="mt-2 text-muted-foreground">{meta ? `${formatNumber(meta.total)} établissements` : ''} recensés dans la région AMM</p>
      </motion.div>

      <div className="mt-6 mb-4 sm:mt-8 sm:mb-6 space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher un établissement..."
              className="pl-10"
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <select value={filtreDren} onChange={(e) => { setFiltreDren(e.target.value); setPage(1); }}
              className="flex h-10 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Tous districts</option>
              {drens.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filtreCisco} onChange={(e) => { setFiltreCisco(e.target.value); setFiltreZap(''); setPage(1); }}
              className="flex h-10 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Tous CISCO</option>
              {ciscos.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filtreZap} onChange={(e) => { setFiltreZap(e.target.value); setPage(1); }}
              className="flex h-10 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Toutes ZAP</option>
              {zaps.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div className="flex sm:hidden gap-2 overflow-x-auto">
            <select value={filtreDren} onChange={(e) => { setFiltreDren(e.target.value); setPage(1); }}
              className="flex-shrink-0 flex h-9 rounded-lg border border-input bg-background px-3 text-xs">...<option value="">District</option>
              {drens.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filtreCisco} onChange={(e) => { setFiltreCisco(e.target.value); setFiltreZap(''); setPage(1); }}
              className="flex-shrink-0 flex h-9 rounded-lg border border-input bg-background px-3 text-xs">
              <option value="">CISCO</option>
              {ciscos.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filtreZap} onChange={(e) => { setFiltreZap(e.target.value); setPage(1); }}
              className="flex-shrink-0 flex h-9 rounded-lg border border-input bg-background px-3 text-xs">
              <option value="">ZAP</option>
              {zaps.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{meta ? `${formatNumber(meta.total)} établissements` : ''}</p>
          <div className="flex items-center gap-1.5 rounded-xl border bg-background p-0.5 shadow-sm">
            <button onClick={() => setViewMode('list')}
              className={`rounded-lg p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Vue liste">
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('gallery')}
              className={`rounded-lg p-2 transition-colors ${viewMode === 'gallery' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Vue galerie">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('map')}
              className={`rounded-lg p-2 transition-colors ${viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Vue carte">
              <Map className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {etablissements.length === 0 && viewMode !== 'map' ? (
        <EmptyState title="Aucun établissement trouvé" icon={<SearchX className="h-8 w-8" />} description={search ? 'Essayez de modifier votre recherche' : ''} />
      ) : viewMode === 'map' ? (
        <div className="h-[600px] overflow-hidden rounded-2xl border">
          <EtablissementsMap schools={allEtablissements} showAleas={false} showTrajets={false}
            onSchoolClick={(id) => router.push(`/etablissements/${id}`)} />
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {etablissements.map((etab, idx) => {
            const status = getEtablissementStatus(etab);
            const StatusIcon = statusIcons[status.variant];
            const mainPhoto = etab.photos?.find((p) => p.estPrincipale) ?? etab.photos?.[0] ?? null;
            return (
              <motion.div key={etab.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                <Card className="cursor-pointer hover:border-primary/20 hover:shadow-md transition-all" onClick={() => router.push(`/etablissements/${etab.id}`)}>
                  <div className="overflow-hidden rounded-t-2xl">
                    <EtablissementPhoto photo={mainPhoto} fixedHeight iconSize={16} className="w-full" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{etab.nomEtab}</h3>
                        <p className="text-sm text-muted-foreground">{etab.dren || 'District non spécifié'}</p>
                      </div>
                      <Badge variant={status.variant} icon={<StatusIcon className="h-3 w-3" />}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3.5 w-3.5" />{[etab.cisco, etab.commune].filter(Boolean).join(' - ') || 'Localisation non spécifiée'}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {formatNumber(etab._count?.batiments ?? 0)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {formatNumber(etab.nbEnseignantG + etab.nbEnseignantF)} ens.</span>
                      {(etab._count?.photos ?? 0) > 0 && (
                        <span className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> {etab._count?.photos}</span>
                      )}
                    </div>
                  </CardContent>
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
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                    <School className="h-20 w-20 text-primary/20" />
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
