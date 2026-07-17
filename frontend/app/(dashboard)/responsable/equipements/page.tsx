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
import type { Equipement } from '@/types/equipement';

export default function EquipementsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<Equipement | null>(null);
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
            Modifier
          </Button>
          <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedEquip(item); setDeleteModalOpen(true); }}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Équipements' }]} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Équipements</h1>
          <p className="mt-1 text-sm text-gray-500">Gestion des équipements ({filtered.length})</p>
        </div>
        <Button onClick={() => router.push('/responsable/equipements/nouveau')}>
          + Nouvel équipement
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher un équipement..." />
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(item) => item.id}
        loading={isLoading}
        emptyMessage="Aucun équipement"
      />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
      </div>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Supprimer l&apos;équipement <strong>{selectedEquip?.nomEquip}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
