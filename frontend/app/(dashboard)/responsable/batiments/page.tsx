'use client';

import { useState } from 'react';
import { useBatiments, useDeleteBatiment } from '@/hooks/use-batiments';
import { DataTable } from '@/components/shared/data-table';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { formatNumber } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { SelectionBar } from '@/components/shared/selection-bar';
import type { Batiment } from '@/types/batiment';

export default function BatimentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBat, setSelectedBat] = useState<Batiment | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const perPage = 10;

  const { data: batiments, isLoading } = useBatiments();
  const { mutate: deleteBat, isPending: isDeleting } = useDeleteBatiment();

  const filtered = (batiments ?? []).filter((b) =>
    !search || b.sigleBat?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = () => {
    if (selectedBat) {
      deleteBat(selectedBat.idBat, {
        onSuccess: () => {
          toast.success('Bâtiment supprimé');
          setDeleteModalOpen(false); setSelectedBat(null);
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
            deleteBat(id, {
              onSuccess: () => resolve(),
              onError: reject,
            });
          })
      )
    ).then(() => {
      toast.success(`${selectedIds.size} bâtiment(s) supprimé(s)`);
      setBulkDeleteModalOpen(false);
      setSelectedIds(new Set());
    }).catch(() => toast.error('Erreur lors de la suppression groupée'));
  };

  const columns = [
    { key: 'sigleBat', header: 'Sigle', render: (item: Batiment) => item.sigleBat || `#${item.idBat}` },
    { key: 'nbNiveau', header: 'Niveaux' },
    {
      key: 'salles',
      header: 'Salles',
      render: (item: Batiment) => <Badge variant="info">{formatNumber((item as any).salles?.length ?? 0)}</Badge>,
    },
    {
      key: 'etablissementId',
      header: 'Établissement #',
      render: (item: Batiment) => `#${item.etablissementId}`,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Batiment) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/responsable/batiments/${item.idBat}`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedBat(item); setDeleteModalOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Bâtiments' }]} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bâtiments</h1>
          <p className="mt-1 text-sm text-gray-500">Gestion des bâtiments ({filtered.length})</p>
        </div>
        <Button onClick={() => router.push('/responsable/batiments/nouveau')}>
          + Nouveau bâtiment
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher un bâtiment..." />
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(item) => item.idBat}
        loading={isLoading}
        emptyMessage="Aucun bâtiment"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={(ids) => setSelectedIds(ids as Set<number>)}
      />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
      </div>

      <SelectionBar
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setBulkDeleteModalOpen(true)}
        isDeleting={isDeleting}
        entityName="bâtiment(s)"
      />

      <Modal open={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)} title="Confirmer la suppression groupée">
        <p className="text-sm text-gray-600">
          Supprimer <strong>{selectedIds.size}</strong> bâtiment{selectedIds.size > 1 ? 's' : ''} ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="ghost" onClick={handleBulkDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Supprimer le bâtiment <strong>{selectedBat?.sigleBat || `#${selectedBat?.idBat}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="ghost" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
