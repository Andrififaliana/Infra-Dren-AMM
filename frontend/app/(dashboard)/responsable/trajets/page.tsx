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
import type { Trajet } from '@/types/trajet';

export default function TrajetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTrajet, setSelectedTrajet] = useState<Trajet | null>(null);
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

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trajets</h1>
          <p className="mt-1 text-sm text-gray-500">Gestion des trajets d&apos;accès ({filtered.length})</p>
        </div>
        <Button onClick={() => router.push('/responsable/trajets/nouveau')}>
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
      />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
      </div>

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
