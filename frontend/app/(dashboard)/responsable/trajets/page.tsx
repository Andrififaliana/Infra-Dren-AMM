'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTrajets, useDeleteTrajet } from '@/hooks/use-trajets';
import { DataTable } from '@/components/shared/data-table';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { toast } from 'sonner';
import { Pencil, Trash2, Route, Calendar, Bus } from 'lucide-react';
import { SelectionBar } from '@/components/shared/selection-bar';
import { GridView, ViewToggle } from '@/components/shared/grid-view';
import { Card, CardContent } from '@/components/ui/card';
import type { Trajet } from '@/types/trajet';

export default function TrajetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTrajet, setSelectedTrajet] = useState<Trajet | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const perPage = 10;

  const { data: trajets, isLoading } = useTrajets();
  const { mutate: deleteTrajet, isPending: isDeleting } = useDeleteTrajet();

  const filtered = (trajets ?? []).filter((t) =>
    !search || t.nomTrajet?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = () => {
    if (selectedTrajet) {
      deleteTrajet(selectedTrajet.idTrajet, {
        onSuccess: () => {
          toast.success('Trajet supprimé');
          setDeleteModalOpen(false); setSelectedTrajet(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
      });
    }
  };

  const handleBulkDelete = () => {
    Promise.all(
      Array.from(selectedIds).map(
        (id) =>
          new Promise<void>((resolve, reject) => {
            deleteTrajet(id, {
              onSuccess: () => resolve(),
              onError: reject,
            });
          })
      )
    ).then(() => {
      toast.success(`${selectedIds.size} trajet(s) supprimé(s)`);
      setBulkDeleteModalOpen(false);
      setSelectedIds(new Set());
    }).catch(() => toast.error('Erreur lors de la suppression groupée'));
  };

  const columns = [
    { key: 'nomTrajet', header: 'Nom' },
    { key: 'debutTrajet', header: 'Début', render: (item: Trajet) => item.debutTrajet ? new Date(item.debutTrajet).toLocaleDateString('fr-FR') : '-' },
    { key: 'finTrajet', header: 'Fin', render: (item: Trajet) => item.finTrajet ? new Date(item.finTrajet).toLocaleDateString('fr-FR') : '-' },
    {
      key: 'moyens',
      header: 'Moyen',
      render: (item: Trajet) => item.moyens?.typeMoyen || '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Trajet) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/responsable/trajets/${item.idTrajet}`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTrajet(item); setDeleteModalOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Trajets' }]} />

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Trajets</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">Gestion des trajets d&apos;accès ({filtered.length})</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <Button onClick={() => router.push('/responsable/trajets/nouveau')} size="sm" className="sm:size-md w-full sm:w-auto">
            + Nouveau trajet
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher un trajet..." />
      </div>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={(item) => item.idTrajet}
          loading={isLoading}
          emptyMessage="Aucun trajet"
          selectable
          selectedIds={selectedIds}
          onSelectionChange={(ids) => setSelectedIds(ids as Set<number>)}
        />
      ) : (
        <GridView
          data={paginated}
          keyExtractor={(item) => item.idTrajet}
          loading={isLoading}
          emptyMessage="Aucun trajet"
          renderCard={(item) => (
            <Card
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
              onClick={() => router.push(`/responsable/trajets/${item.idTrajet}`)}
            >
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5">
                    <Route className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-sm truncate">{item.nomTrajet || `Trajet #${item.idTrajet}`}</h3>
                    {item.moyens?.typeMoyen && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Bus className="h-3 w-3" />
                        {item.moyens.typeMoyen}
                        {item.moyens.distanceMoyen && ` · ${item.moyens.distanceMoyen} km`}
                        {item.moyens.dureeMoyen && ` · ${item.moyens.dureeMoyen}h`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {item.debutTrajet && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.debutTrajet).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {item.finTrajet && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.finTrajet).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end pt-1 border-t border" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => router.push(`/responsable/trajets/${item.idTrajet}`)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelectedTrajet(item); setDeleteModalOpen(true); }}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
        entityName="trajet(s)"
      />

      <Modal open={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)} title="Confirmer la suppression groupée">
        <p className="text-sm text-muted-foreground">
          Supprimer <strong>{selectedIds.size}</strong> trajet{selectedIds.size > 1 ? 's' : ''} ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleBulkDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-muted-foreground">
          Supprimer le trajet <strong>{selectedTrajet?.nomTrajet || `#${selectedTrajet?.idTrajet}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
