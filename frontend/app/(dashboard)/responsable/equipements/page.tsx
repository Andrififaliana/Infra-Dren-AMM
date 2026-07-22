'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEquipements, useDeleteEquipement } from '@/hooks/use-equipements';
import { DataTable } from '@/components/shared/data-table';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { toast } from 'sonner';
import { Pencil, Trash2, Wrench, Package, Tag } from 'lucide-react';
import { SelectionBar } from '@/components/shared/selection-bar';
import { GridView, ViewToggle } from '@/components/shared/grid-view';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Equipement } from '@/types/equipement';

export default function EquipementsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<Equipement | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const perPage = 10;

  const { data: equipements, isLoading } = useEquipements();
  const { mutate: deleteEquip, isPending: isDeleting } = useDeleteEquipement();

  const filtered = (equipements ?? []).filter((e) =>
    !search || e.nomEquip?.toLowerCase().includes(search.toLowerCase()) || e.typeEquip?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = () => {
    if (selectedEquip) {
      deleteEquip(selectedEquip.id, {
        onSuccess: () => {
          toast.success('Équipement supprimé');
          setDeleteModalOpen(false); setSelectedEquip(null);
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
            deleteEquip(id, {
              onSuccess: () => resolve(),
              onError: reject,
            });
          })
      )
    ).then(() => {
      toast.success(`${selectedIds.size} équipement(s) supprimé(s)`);
      setBulkDeleteModalOpen(false);
      setSelectedIds(new Set());
    }).catch(() => toast.error('Erreur lors de la suppression groupée'));
  };

  const columns = [
    { key: 'nomEquip', header: 'Nom' },
    { key: 'typeEquip', header: 'Type' },
    { key: 'etat', header: 'État' },
    { key: 'quantite', header: 'Quantité' },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Equipement) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/responsable/equipements/${item.id}`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedEquip(item); setDeleteModalOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Équipements' }]} />

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Équipements</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">Gestion des équipements ({filtered.length})</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <Button onClick={() => router.push('/responsable/equipements/nouveau')} size="sm" className="sm:size-md w-full sm:w-auto">
            + Nouvel équipement
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher un équipement..." />
      </div>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyMessage="Aucun équipement"
          selectable
          selectedIds={selectedIds}
          onSelectionChange={(ids) => setSelectedIds(ids as Set<number>)}
        />
      ) : (
        <GridView
          data={paginated}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyMessage="Aucun équipement"
          renderCard={(item) => (
            <Card
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
              onClick={() => router.push(`/responsable/equipements/${item.id}`)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-sm truncate">{item.nomEquip}</h3>
                    {item.typeEquip && (
                      <p className="text-xs text-muted-foreground">{item.typeEquip}</p>
                    )}
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span                    className="text-sm font-bold text-primary">{item.quantite}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {item.etat ? (
                    <Badge
                      variant={item.etat === 'BON' ? 'success' : item.etat === 'MOYEN' ? 'warning' : 'destructive'}
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      {item.etat}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">État non renseigné</span>
                  )}
                </div>

                <div className="flex items-center justify-end pt-1 border-t border" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => router.push(`/responsable/equipements/${item.id}`)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelectedEquip(item); setDeleteModalOpen(true); }}
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
        entityName="équipement(s)"
      />

      <Modal open={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)} title="Confirmer la suppression groupée">
        <p className="text-sm text-muted-foreground">
          Supprimer <strong>{selectedIds.size}</strong> équipement{selectedIds.size > 1 ? 's' : ''} ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleBulkDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-muted-foreground">
          Supprimer l&apos;équipement <strong>{selectedEquip?.nomEquip}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
