'use client';

import { useState, useMemo } from 'react';
import { useBatiments, useDeleteBatiment } from '@/hooks/use-batiments';
import { useEtablissements } from '@/hooks/use-etablissements';
import { DataTable } from '@/components/shared/data-table';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { formatNumber } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Trash2, Filter } from 'lucide-react';
import { SelectionBar } from '@/components/shared/selection-bar';
import type { Batiment } from '@/types/batiment';

export default function BatimentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [etablissementFilter, setEtablissementFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBat, setSelectedBat] = useState<Batiment | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const perPage = 10;

  const { data: etablissementsData } = useEtablissements({ page: 1, limit: 999 });
  const { data: batiments, isLoading } = useBatiments(etablissementFilter ? parseInt(etablissementFilter) : undefined);
  const { mutate: deleteBat, isPending: isDeleting } = useDeleteBatiment();

  const etablissementOptions = useMemo(() => {
    const list = etablissementsData?.data ?? [];
    return list.map(e => ({ value: String(e.id), label: `${e.nomEtab} (${e.cisco || 'N/A'})` }));
  }, [etablissementsData]);

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
      key: 'etablissement',
      header: 'Établissement',
      render: (item: Batiment & { etablissement?: { nomEtab: string } }) =>
        (item as any).etablissement?.nomEtab ?? `#${item.etablissementId}`,
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

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bâtiments</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">Gestion des bâtiments ({filtered.length})</p>
        </div>
        <Button onClick={() => router.push('/responsable/batiments/nouveau')} size="sm" className="sm:size-md w-full sm:w-auto">
          + Nouveau bâtiment
        </Button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher un bâtiment..." className="w-full sm:flex-1" />
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto [-webkit-overflow-scrolling:touch] pb-1">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <Select
            value={etablissementFilter}
            onChange={(e) => { setEtablissementFilter(e.target.value); setPage(1); }}
            options={etablissementOptions}
            placeholder="Tous les établissements"
            className="w-52 sm:w-64 shrink-0"
          />
        </div>
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
