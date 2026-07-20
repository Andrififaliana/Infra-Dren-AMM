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
import { Pencil, Trash2 } from 'lucide-react';
import { SelectionBar } from '@/components/shared/selection-bar';
import type { Trajet } from '@/types/trajet';

export default function TrajetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTrajet, setSelectedTrajet] = useState<Trajet | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Trajets</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">Gestion des trajets d&apos;accès ({filtered.length})</p>
        </div>
        <Button onClick={() => router.push('/responsable/trajets/nouveau')} size="sm" className="sm:size-md w-full sm:w-auto">
          + Nouveau trajet
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher un trajet..." />
      </div>

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
        <p className="text-sm text-gray-600">
          Supprimer <strong>{selectedIds.size}</strong> trajet{selectedIds.size > 1 ? 's' : ''} ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="ghost" onClick={handleBulkDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Supprimer le trajet <strong>{selectedTrajet?.nomTrajet || `#${selectedTrajet?.idTrajet}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="ghost" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
