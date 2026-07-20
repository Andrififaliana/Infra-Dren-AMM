'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSalles, useDeleteSalle } from '@/hooks/use-salles';
import { useBatiments } from '@/hooks/use-batiments';
import { DataTable, BooleanBadge } from '@/components/shared/data-table';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { toast } from 'sonner';
import { Pencil, Trash2, Filter } from 'lucide-react';
import { SelectionBar } from '@/components/shared/selection-bar';
import type { Salle } from '@/types/salle';

export default function SallesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [batimentFilter, setBatimentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalle, setSelectedSalle] = useState<Salle | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const perPage = 10;

  const { data: batiments } = useBatiments();
  const { data: salles, isLoading } = useSalles(batimentFilter ? parseInt(batimentFilter) : undefined);
  const { mutate: deleteSalle, isPending: isDeleting } = useDeleteSalle();

  const batimentOptions = useMemo(() => {
    const list = batiments ?? [];
    return list.map(b => ({ value: String(b.idBat), label: b.sigleBat || `#${b.idBat}` }));
  }, [batiments]);

  const filtered = (salles ?? []).filter((s) =>
    !search || s.sigleSalle?.toLowerCase().includes(search.toLowerCase()) || s.affectationSalle?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = () => {
    if (selectedSalle) {
      deleteSalle(selectedSalle.idSalle, {
        onSuccess: () => {
          toast.success('Salle supprimée');
          setDeleteModalOpen(false); setSelectedSalle(null);
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
            deleteSalle(id, {
              onSuccess: () => resolve(),
              onError: reject,
            });
          })
      )
    ).then(() => {
      toast.success(`${selectedIds.size} salle(s) supprimée(s)`);
      setBulkDeleteModalOpen(false);
      setSelectedIds(new Set());
    }).catch(() => toast.error('Erreur lors de la suppression groupée'));
  };

  const columns = [
    { key: 'sigleSalle', header: 'Sigle', render: (item: Salle) => item.sigleSalle || `#${item.idSalle}` },
    { key: 'niveauSalle', header: 'Niveau' },
    {
      key: 'batiment',
      header: 'Bâtiment',
      render: (item: Salle) => item.batiment?.sigleBat ?? `#${item.batimentId}`,
    },
    { key: 'affectationSalle', header: 'Affectation' },
    { key: 'etatSalle', header: 'État' },
    { key: 'estOperationnel', header: 'Opérationnel', render: (item: Salle) => <BooleanBadge value={item.estOperationnel} /> },
    { key: 'estElectrifiee', header: 'Électrifiée', render: (item: Salle) => <BooleanBadge value={item.estElectrifiee} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Salle) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/responsable/salles/${item.idSalle}`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSalle(item); setDeleteModalOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Salles' }]} />

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Salles</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">Gestion des salles de classe ({filtered.length})</p>
        </div>
        <Button onClick={() => router.push('/responsable/salles/nouveau')} size="sm" className="sm:size-md w-full sm:w-auto">
          + Nouvelle salle
        </Button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher une salle..." className="w-full sm:flex-1" />
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto [-webkit-overflow-scrolling:touch] pb-1">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <Select
            value={batimentFilter}
            onChange={(e) => { setBatimentFilter(e.target.value); setPage(1); }}
            options={batimentOptions}
            placeholder="Tous les bâtiments"
            className="w-52 sm:w-56 shrink-0"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(item) => item.idSalle}
        loading={isLoading}
        emptyMessage="Aucune salle"
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
        entityName="salle(s)"
      />

      <Modal open={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)} title="Confirmer la suppression groupée">
        <p className="text-sm text-gray-600">
          Supprimer <strong>{selectedIds.size}</strong> salle{selectedIds.size > 1 ? 's' : ''} ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="ghost" onClick={handleBulkDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Supprimer la salle <strong>{selectedSalle?.sigleSalle || `#${selectedSalle?.idSalle}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="ghost" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
