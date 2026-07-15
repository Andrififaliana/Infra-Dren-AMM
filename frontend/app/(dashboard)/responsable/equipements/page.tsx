'use client';

import { useState } from 'react';
import { useEquipements, useDeleteEquipement } from '@/hooks/use-equipements';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Equipement } from '@/types/equipement';

export default function EquipementsPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<Equipement | null>(null);

  const { data: equipements, isLoading } = useEquipements();
  const { mutate: deleteEquip, isPending: isDeleting } = useDeleteEquipement();

  const handleDelete = () => {
    if (selectedEquip) {
      deleteEquip(selectedEquip.id, {
        onSuccess: () => { setDeleteModalOpen(false); setSelectedEquip(null); },
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
        <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedEquip(item); setDeleteModalOpen(true); }}>
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Équipements</h1>
        <p className="mt-1 text-sm text-gray-500">Gestion des équipements</p>
      </div>

      <DataTable
        columns={columns}
        data={equipements ?? []}
        keyExtractor={(item) => item.id}
        loading={isLoading}
        emptyMessage="Aucun équipement"
      />

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
