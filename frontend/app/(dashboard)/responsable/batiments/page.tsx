'use client';

import { useState } from 'react';
import { useBatiments, useDeleteBatiment } from '@/hooks/use-batiments';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatNumber } from '@/lib/utils';
import type { Batiment } from '@/types/batiment';

export default function BatimentsPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBat, setSelectedBat] = useState<Batiment | null>(null);

  const { data: batiments, isLoading } = useBatiments();
  const { mutate: deleteBat, isPending: isDeleting } = useDeleteBatiment();

  const handleDelete = () => {
    if (selectedBat) {
      deleteBat(selectedBat.idBat, {
        onSuccess: () => { setDeleteModalOpen(false); setSelectedBat(null); },
      });
    }
  };

  const columns = [
    { key: 'sigleBat', header: 'Sigle', render: (item: Batiment) => item.sigleBat || `#${item.idBat}` },
    { key: 'nbNiveau', header: 'Niveaux' },
    {
      key: 'salles',
      header: 'Salles',
      render: (item: Batiment) => <Badge variant="info">{formatNumber(item.salles?.length ?? 0)}</Badge>,
    },
    {
      key: 'etablissementId',
      header: 'Établissement #',
      render: (item: Batiment) => `#${item.etablissementId}`,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Batiment) => (
        <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedBat(item); setDeleteModalOpen(true); }}>
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bâtiments</h1>
        <p className="mt-1 text-sm text-gray-500">Gestion des bâtiments</p>
      </div>

      <DataTable
        columns={columns}
        data={batiments ?? []}
        keyExtractor={(item) => item.idBat}
        loading={isLoading}
        emptyMessage="Aucun bâtiment"
      />

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Supprimer le bâtiment <strong>{selectedBat?.sigleBat || `#${selectedBat?.idBat}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
