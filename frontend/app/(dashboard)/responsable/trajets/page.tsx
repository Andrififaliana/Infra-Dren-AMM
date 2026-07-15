'use client';

import { useState } from 'react';
import { useTrajets, useDeleteTrajet } from '@/hooks/use-trajets';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Trajet } from '@/types/trajet';

export default function TrajetsPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTrajet, setSelectedTrajet] = useState<Trajet | null>(null);

  const { data: trajets, isLoading } = useTrajets();
  const { mutate: deleteTrajet, isPending: isDeleting } = useDeleteTrajet();

  const handleDelete = () => {
    if (selectedTrajet) {
      deleteTrajet(selectedTrajet.idTrajet, {
        onSuccess: () => { setDeleteModalOpen(false); setSelectedTrajet(null); },
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
        <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTrajet(item); setDeleteModalOpen(true); }}>
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trajets</h1>
        <p className="mt-1 text-sm text-gray-500">Gestion des trajets d&apos;accès</p>
      </div>

      <DataTable
        columns={columns}
        data={trajets ?? []}
        keyExtractor={(item) => item.idTrajet}
        loading={isLoading}
        emptyMessage="Aucun trajet"
      />

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Supprimer le trajet <strong>{selectedTrajet?.nomTrajet || `#${selectedTrajet?.idTrajet}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
