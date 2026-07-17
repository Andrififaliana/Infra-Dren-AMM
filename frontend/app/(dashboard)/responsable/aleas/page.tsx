'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAleas, useDeleteAlea } from '@/hooks/use-aleas';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import type { Alea } from '@/types/alea';

export default function AleasPage() {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAlea, setSelectedAlea] = useState<Alea | null>(null);

  const { data: aleas, isLoading } = useAleas();
  const { mutate: deleteAlea, isPending: isDeleting } = useDeleteAlea();

  const handleDelete = () => {
    if (selectedAlea) {
      deleteAlea(selectedAlea.idAleat, {
        onSuccess: () => { setDeleteModalOpen(false); setSelectedAlea(null); },
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
            Modifier
          </Button>
          <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedAlea(item); setDeleteModalOpen(true); }}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aléas</h1>
          <p className="mt-1 text-sm text-gray-500">Gestion des aléas naturels</p>
        </div>
        <Button onClick={() => router.push('/responsable/aleas/nouveau')}>
          + Nouvel aléa
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={aleas ?? []}
        keyExtractor={(item) => item.idAleat}
        loading={isLoading}
        emptyMessage="Aucun aléa"
      />

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Supprimer l&apos;aléa <strong>{selectedAlea?.nomAleat || `#${selectedAlea?.idAleat}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
