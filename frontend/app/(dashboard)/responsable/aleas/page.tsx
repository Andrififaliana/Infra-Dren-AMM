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
import { Pencil, Trash2 } from 'lucide-react';
import type { Alea } from '@/types/alea';

export default function AleasPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAlea, setSelectedAlea] = useState<Alea | null>(null);
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
      render: (item: Alea) => <Badge variant="info">{item.effets?.length ?? 0} trajet(s)</Badge>,
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

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aléas</h1>
          <p className="mt-1 text-sm text-gray-500">Gestion des aléas naturels ({filtered.length})</p>
        </div>
        <Button onClick={() => router.push('/responsable/aleas/nouveau')}>
          + Nouvel aléa
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher un aléa..." />
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(item) => item.idAleat}
        loading={isLoading}
        emptyMessage="Aucun aléa"
      />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
      </div>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Supprimer l&apos;aléa <strong>{selectedAlea?.nomAleat || `#${selectedAlea?.idAleat}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="ghost" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
