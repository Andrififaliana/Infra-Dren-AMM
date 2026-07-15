'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEtablissements } from '@/hooks/use-etablissements';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatNumber } from '@/lib/utils';

export default function EtablissementsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filtreDren, setFiltreDren] = useState('');

  const { data, isLoading } = useEtablissements({
    page,
    limit: 12,
    search: search || undefined,
    dren: filtreDren || undefined,
  });

  const etablissements = data?.data ?? [];
  const meta = data?.meta;

  // Extract unique DREN values for filter
  const drens = [...new Set(etablissements.map((e) => e.dren).filter(Boolean))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Établissements scolaires</h1>
        <p className="mt-2 text-gray-600">
          Liste des établissements scolaires de la DREN AMM
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Rechercher un établissement..."
          />
        </div>
        <select
          value={filtreDren}
          onChange={(e) => { setFiltreDren(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Toutes les DREN</option>
          {drens.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent>
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-1 h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : etablissements.length === 0 ? (
        <EmptyState
          title="Aucun établissement trouvé"
          description={search ? 'Essayez de modifier votre recherche' : 'Aucun établissement pour le moment'}
          icon="🔍"
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {etablissements.map((etab) => (
              <Card
                key={etab.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-blue-200"
                onClick={() => router.push(`/etablissements/${etab.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{etab.nomEtab}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>
                        {[etab.dren, etab.cisco, etab.commune].filter(Boolean).join(' - ') || 'Non renseigné'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="info">
                        🏗️ {formatNumber(etab._count?.batiments ?? 0)} bâtiments
                      </Badge>
                      <Badge variant="default">
                        📋 {formatNumber(etab._count?.designations ?? 0)} désignations
                      </Badge>
                      <Badge variant="default">
                        🏛️ {formatNumber(etab._count?.structures ?? 0)} structures
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span>📞 {etab.couvTelephonique ? 'Oui' : 'Non'}</span>
                      <span>🌐 {etab.couvInternet ? 'Oui' : 'Non'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {meta && (
            <div className="mt-8">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
