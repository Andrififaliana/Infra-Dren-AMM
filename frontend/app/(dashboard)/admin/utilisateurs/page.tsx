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
import { Trash2, MailCheck, UserCircle, Shield, Clock } from 'lucide-react';
import { SelectionBar } from '@/components/shared/selection-bar';
import { GridView, ViewToggle } from '@/components/shared/grid-view';
import { Card, CardContent } from '@/components/ui/card';
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [formData, setFormData] = useState<UserFormData>({ email: '', nom: '', password: '', role: 'RESPONSABLE_INFRASTRUCTURE' });
  const [showConfirmBanner, setShowConfirmBanner] = useState(false);
  const [createdEmail, setCreatedEmail] = useState('');

  const { data, isLoading } = useUsers({ page, limit: 10, search: search || undefined });
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const users = data?.data ?? [];
  const meta = data?.meta;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser(formData, {
      onSuccess: (result: any) => {
        setCreateModalOpen(false);
        setCreatedEmail(formData.email);
        setShowConfirmBanner(true);
        setFormData({ email: '', nom: '', password: '', role: 'RESPONSABLE_INFRASTRUCTURE' });
        // Cacher la bannière après 8 secondes
        setTimeout(() => setShowConfirmBanner(false), 8000);
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

  const handleBulkDelete = () => {
    Promise.all(
      Array.from(selectedIds).map(
        (id) =>
          new Promise<void>((resolve, reject) => {
            deleteUser(id, {
              onSuccess: () => resolve(),
              onError: reject,
            });
          })
      )
    ).then(() => {
      setBulkDeleteModalOpen(false);
      setSelectedIds(new Set());
    });
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
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedUser(item); setDeleteModalOpen(true); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gérer les accès à l&apos;application</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <Button onClick={() => setCreateModalOpen(true)}>+ Nouvel utilisateur</Button>
        </div>
      </div>

      {showConfirmBanner && (                <div className="mb-4 rounded-xl bg-primary/5 p-4 flex items-start gap-3 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">Utilisateur créé avec succès</p>
            <p className="text-xs text-primary mt-0.5">
              Un email de confirmation a été envoyé à <strong>{createdEmail}</strong>.
              L&apos;utilisateur doit cliquer sur le lien pour activer son compte.
            </p>
          </div>
          <button
            onClick={() => setShowConfirmBanner(false)}
            className="text-primary/70 hover:text-primary transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
      </div>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyMessage="Aucun utilisateur"
          selectable
          selectedIds={selectedIds}
          onSelectionChange={(ids) => setSelectedIds(ids as Set<number>)}
        />
      ) : (
        <GridView
          data={users}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyMessage="Aucun utilisateur"
          renderCard={(item) => (
            <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
                    <UserCircle className={`h-6 w-6 ${item.actif ? 'text-foreground' : 'text-muted-foreground/50'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-sm truncate">{item.nom}</h3>
                    <p className="text-xs text-muted-foreground truncate">{item.email}</p>
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full mt-1.5 ${item.actif ? 'bg-primary/50' : 'bg-destructive/50'}`} />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    {item.role === 'ADMIN' ? 'Admin' : 'Responsable'}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDateShort(item.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-end pt-1 border-t" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setSelectedUser(item); setDeleteModalOpen(true); }}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        />
      )}

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

      <SelectionBar
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setBulkDeleteModalOpen(true)}
        isDeleting={isDeleting}
        entityName="utilisateur(s)"
      />

      <Modal open={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)} title="Confirmer la suppression groupée">
        <p className="text-sm text-muted-foreground">
          Supprimer <strong>{selectedIds.size}</strong> utilisateur{selectedIds.size > 1 ? 's' : ''} ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="ghost" onClick={handleBulkDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-muted-foreground">
          Êtes-vous sûr de vouloir supprimer <strong>{selectedUser?.nom}</strong> ({selectedUser?.email}) ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Annuler
          </Button>
          <Button variant="ghost" onClick={handleDelete} loading={isDeleting}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
