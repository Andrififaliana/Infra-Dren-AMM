'use client';

import { useState } from 'react';
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/use-users';
import { DataTable, BooleanBadge } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { SearchBar } from '@/components/shared/search-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatDateShort } from '@/lib/utils';
import type { User, Role } from '@/types/user';

interface UserFormData {
  email: string;
  nom: string;
  password: string;
  role: Role;
}

export default function UtilisateursPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({ email: '', nom: '', password: '', role: 'RESPONSABLE_INFRASTRUCTURE' });

  const { data, isLoading } = useUsers({ page, limit: 10, search: search || undefined });
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const users = data?.data ?? [];
  const meta = data?.meta;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser(formData, {
      onSuccess: () => {
        setCreateModalOpen(false);
        setFormData({ email: '', nom: '', password: '', role: 'RESPONSABLE_INFRASTRUCTURE' });
      },
    });
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        },
      });
    }
  };

  const columns = [
    { key: 'nom', header: 'Nom' },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Rôle',
      render: (item: User) => (
        <Badge variant={item.role === 'ADMIN' ? 'info' : 'default'}>
          {item.role === 'ADMIN' ? 'Admin' : 'Responsable'}
        </Badge>
      ),
    },
    {
      key: 'actif',
      header: 'Actif',
      render: (item: User) => <BooleanBadge value={item.actif} />,
    },
    {
      key: 'createdAt',
      header: 'Créé le',
      render: (item: User) => formatDateShort(item.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: User) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => { setSelectedUser(item); setDeleteModalOpen(true); }}
          >
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
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-500">Gérer les accès à l&apos;application</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>+ Nouvel utilisateur</Button>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(item) => item.id}
        loading={isLoading}
        emptyMessage="Aucun utilisateur"
      />

      {meta && (
        <div className="mt-4">
          <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Nouvel utilisateur">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="nom"
            label="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            id="password"
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Select
            id="role"
            label="Rôle"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
            options={[
              { value: 'ADMIN', label: 'Administrateur' },
              { value: 'RESPONSABLE_INFRASTRUCTURE', label: 'Responsable infrastructure' },
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={isCreating}>
              Créer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-gray-600">
          Êtes-vous sûr de vouloir supprimer <strong>{selectedUser?.nom}</strong> ({selectedUser?.email}) ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
