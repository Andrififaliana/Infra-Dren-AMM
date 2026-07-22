'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAleas, useDeleteAlea } from '@/hooks/use-aleas';
import { DataTable } from '@/components/shared/data-table';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { toast } from 'sonner';
import { Pencil, Trash2, AlertTriangle, Calendar, Info } from 'lucide-react';
import { SelectionBar } from '@/components/shared/selection-bar';
import { GridView, ViewToggle } from '@/components/shared/grid-view';
import { Card, CardContent } from '@/components/ui/card';
import type { Alea } from '@/types/alea';

export default function AleasPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAlea, setSelectedAlea] = useState<Alea | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const perPage = 10;

  const { data: aleas, isLoading } = useAleas();
  const { mutate: deleteAlea, isPending: isDeleting } = useDeleteAlea();

  const filtered = (aleas ?? []).filter((a) =>
    !search || a.nomAleat?.toLowerCase().includes(search.toLowerCase()) || a.typeAleat?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = () => {
    if (selectedAlea) {
      deleteAlea(selectedAlea.idAleat, {
        onSuccess: () => {
          toast.success('Aléa supprimé');
          setDeleteModalOpen(false); setSelectedAlea(null);
        },
        onError: () => toast.error("Erreur lors de la suppression"),
      });
    }
  };

  const handleBulkDelete = () => {
    Promise.all(
      Array.from(selectedIds).map(
        (id) =>
          new Promise<void>((resolve, reject) => {
            deleteAlea(id, {
              onSuccess: () => resolve(),
              onError: reject,
            });
          })
      )
    ).then(() => {
      toast.success(`${selectedIds.size} aléa(s) supprimé(s)`);
      setBulkDeleteModalOpen(false);
      setSelectedIds(new Set());
    }).catch(() => toast.error('Erreur lors de la suppression groupée'));
  };

  const columns = [
    { key: 'nomAleat', header: 'Nom' },
    { key: 'typeAleat', header: 'Type' },
    {
      key: 'dateAleat',
      header: 'Date',
      render: (item: Alea) => item.dateAleat ? new Date(item.dateAleat).toLocaleDateString('fr-FR') : '-',
    },
    {
      key: 'effets',
      header: 'Impact',
      render: (item: Alea) => <Badge variant="secondary">{item.effets?.length ?? 0} trajet(s)</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Alea) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/responsable/aleas/${item.idAleat}`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAlea(item); setDeleteModalOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Aléas' }]} />

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Aléas</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">Gestion des aléas naturels ({filtered.length})</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <Button onClick={() => router.push('/responsable/aleas/nouveau')} size="sm" className="sm:size-md w-full sm:w-auto">
            + Nouvel aléa
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher un aléa..." />
      </div>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={(item) => item.idAleat}
          loading={isLoading}
          emptyMessage="Aucun aléa"
          selectable
          selectedIds={selectedIds}
          onSelectionChange={(ids) => setSelectedIds(ids as Set<number>)}
        />
      ) : (
        <GridView
          data={paginated}
          keyExtractor={(item) => item.idAleat}
          loading={isLoading}
          emptyMessage="Aucun aléa"
          renderCard={(item) => {
            const typeColors: Record<string, string> = {
              'INONDATION': 'bg-chart-4/10 border-chart-4/30 text-chart-4',
              'CYCLONE': 'bg-chart-2/10 border-chart-2/30 text-chart-2',
              'SECHERESSE': 'bg-chart-2/10 border-chart-2/30 text-chart-2',
              'GLISSEMENT': 'bg-destructive/10 border-destructive/30 text-destructive',
              'INCENDIE': 'bg-destructive/10 border-destructive/30 text-destructive',
            };
            const colorClass = item.typeAleat ? typeColors[item.typeAleat.toUpperCase()] || 'bg-muted/50 border-muted-foreground/20 text-foreground' : 'bg-muted/50 border-muted-foreground/20 text-foreground';
            return (
              <Card
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
                onClick={() => router.push(`/responsable/aleas/${item.idAleat}`)}
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 ${colorClass}`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm truncate">{item.nomAleat || `Aléa #${item.idAleat}`}</h3>
                      {item.typeAleat && (
                        <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium border ${colorClass}`}>
                          {item.typeAleat}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {item.dateAleat && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.dateAleat).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {item.effets?.length ?? 0} trajet(s) impacté(s)
                    </span>
                  </div>

                  {item.explication && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.explication}</p>
                  )}

                  <div className="flex items-center justify-end pt-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button
                        onClick={() => router.push(`/responsable/aleas/${item.idAleat}`)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { setSelectedAlea(item); setDeleteModalOpen(true); }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }}
        />
      )}

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
      </div>

      <SelectionBar
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setBulkDeleteModalOpen(true)}
        isDeleting={isDeleting}
        entityName="aléa(s)"
      />

      <Modal open={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)} title="Confirmer la suppression groupée">
        <p className="text-sm text-muted-foreground">
          Supprimer <strong>{selectedIds.size}</strong> aléa{selectedIds.size > 1 ? 's' : ''} ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleBulkDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-muted-foreground">
          Supprimer l&apos;aléa <strong>{selectedAlea?.nomAleat || `#${selectedAlea?.idAleat}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
