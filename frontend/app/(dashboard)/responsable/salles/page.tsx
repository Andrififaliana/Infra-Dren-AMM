'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSalles, useDeleteSalle } from '@/hooks/use-salles';
import { DataTable, BooleanBadge } from '@/components/shared/data-table';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { toast } from 'sonner';
import type { Salle } from '@/types/salle';

export default function SallesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalle, setSelectedSalle] = useState<Salle | null>(null);
  const perPage = 10;

  const { data: salles, isLoading } = useSalles();
  const { mutate: deleteSalle, isPending: isDeleting } = useDeleteSalle();

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

  const columns = [
    { key: 'sigleSalle', header: 'Sigle', render: (item: Salle) => item.sigleSalle || `#${item.idSalle}` },
    { key: 'niveauSalle', header: 'Niveau' },
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
            Modifier
          </Button>
          <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSalle(item); setDeleteModalOpen(true); }}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Salles' }]} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salles</h1>
          <p className="mt-1 text-sm text-gray-500">Gestion des salles de classe ({filtered.length})</p>
        </div>
        <Button onClick={() => router.push('/responsable/salles/nouveau')}>
          + Nouvelle salle
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher une salle..." />
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(item) => item.idSalle}
        loading={isLoading}
        emptyMessage="Aucune salle"
      />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
      </div>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Supprimer la salle <strong>{selectedSalle?.sigleSalle || `#${selectedSalle?.idSalle}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
