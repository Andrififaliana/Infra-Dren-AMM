'use client';

import { useState } from 'react';
import { useSalles, useDeleteSalle } from '@/hooks/use-salles';
import { DataTable, BooleanBadge } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Salle } from '@/types/salle';

export default function SallesPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalle, setSelectedSalle] = useState<Salle | null>(null);

  const { data: salles, isLoading } = useSalles();
  const { mutate: deleteSalle, isPending: isDeleting } = useDeleteSalle();

  const handleDelete = () => {
    if (selectedSalle) {
      deleteSalle(selectedSalle.idSalle, {
        onSuccess: () => { setDeleteModalOpen(false); setSelectedSalle(null); },
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
        <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSalle(item); setDeleteModalOpen(true); }}>
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Salles</h1>
        <p className="mt-1 text-sm text-gray-500">Gestion des salles de classe</p>
      </div>

      <DataTable
        columns={columns}
        data={salles ?? []}
        keyExtractor={(item) => item.idSalle}
        loading={isLoading}
        emptyMessage="Aucune salle"
      />

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
