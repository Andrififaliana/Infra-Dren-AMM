'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSalles, useDeleteSalle } from '@/hooks/use-salles';
import { useBatiments } from '@/hooks/use-batiments';
import { DataTable, BooleanBadge } from '@/components/shared/data-table';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { toast } from 'sonner';
import { Pencil, Trash2, Filter, DoorOpen, Lightbulb, Users } from 'lucide-react';
import { SelectionBar } from '@/components/shared/selection-bar';
import { GridView, ViewToggle } from '@/components/shared/grid-view';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Salle } from '@/types/salle';

export default function SallesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [batimentFilter, setBatimentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalle, setSelectedSalle] = useState<Salle | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const perPage = 10;

  const { data: batiments } = useBatiments();
  const { data: salles, isLoading } = useSalles(batimentFilter ? parseInt(batimentFilter) : undefined);
  const { mutate: deleteSalle, isPending: isDeleting } = useDeleteSalle();

  const batimentOptions = useMemo(() => {
    const list = batiments ?? [];
    return list.map(b => ({ value: String(b.idBat), label: b.sigleBat || `#${b.idBat}` }));
  }, [batiments]);

  const filtered = (salles ?? []).filter((s) =>
    !search || s.sigleSalle?.toLowerCase().includes(search.toLowerCase()) || s.affectationSalle?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = () => {
    if (selectedSalle) {
      deleteSalle(selectedSalle.idSalle, {
        onSuccess: () => {
          toast.success('Salle supprimée');
          setDeleteModalOpen(false); setSelectedSalle(null);
        },
        onError: () => toast.error('Erreur lors de la suppression'),
      });
    }
  };

  const handleBulkDelete = () => {
    Promise.all(
      Array.from(selectedIds).map(
        (id) =>
          new Promise<void>((resolve, reject) => {
            deleteSalle(id, {
              onSuccess: () => resolve(),
              onError: reject,
            });
          })
      )
    ).then(() => {
      toast.success(`${selectedIds.size} salle(s) supprimée(s)`);
      setBulkDeleteModalOpen(false);
      setSelectedIds(new Set());
    }).catch(() => toast.error('Erreur lors de la suppression groupée'));
  };

  const columns = [
    { key: 'sigleSalle', header: 'Sigle', render: (item: Salle) => item.sigleSalle || `#${item.idSalle}` },
    { key: 'niveauSalle', header: 'Niveau' },
    {
      key: 'batiment',
      header: 'Bâtiment',
      render: (item: Salle) => item.batiment?.sigleBat ?? `#${item.batimentId}`,
    },
    { key: 'affectationSalle', header: 'Affectation' },
    { key: 'etatSalle', header: 'État' },
    { key: 'estOperationnel', header: 'Opérationnel', render: (item: Salle) => <BooleanBadge value={item.estOperationnel} /> },
    { key: 'estElectrifiee', header: 'Électrifiée', render: (item: Salle) => <BooleanBadge value={item.estElectrifiee} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Salle) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/responsable/salles/${item.idSalle}`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSalle(item); setDeleteModalOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Salles' }]} />

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Salles</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">Gestion des salles de classe ({filtered.length})</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <Button onClick={() => router.push('/responsable/salles/nouveau')} size="sm" className="sm:size-md w-full sm:w-auto">
            + Nouvelle salle
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher une salle..." className="w-full sm:flex-1" />
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto [-webkit-overflow-scrolling:touch] pb-1">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select
            value={batimentFilter}
            onChange={(e) => { setBatimentFilter(e.target.value); setPage(1); }}
            options={batimentOptions}
            placeholder="Tous les bâtiments"
            className="w-52 sm:w-56 shrink-0"
          />
        </div>
      </div>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={(item) => item.idSalle}
          loading={isLoading}
          emptyMessage="Aucune salle"
          selectable
          selectedIds={selectedIds}
          onSelectionChange={(ids) => setSelectedIds(ids as Set<number>)}
        />
      ) : (
        <GridView
          data={paginated}
          keyExtractor={(item) => item.idSalle}
          loading={isLoading}
          emptyMessage="Aucune salle"
          renderCard={(item) => (
            <Card
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
              onClick={() => router.push(`/responsable/salles/${item.idSalle}`)}
            >
              {/* Status color bar */}
              <div className={`h-1.5 rounded-t-xl ${item.estOperationnel ? 'bg-primary' : 'bg-destructive/50'}`} />
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{item.sigleSalle || `Salle #${item.idSalle}`}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.affectationSalle || 'Non affectée'} · Niveau {item.niveauSalle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.estElectrifiee && (
                      <span className="rounded-full bg-chart-2/20 p-1" title="Électrifiée">
                        <Lightbulb className="h-3 w-3 text-chart-2" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DoorOpen className="h-3.5 w-3.5" />
                    {item.batiment?.sigleBat ?? `#${item.batimentId}`}
                  </span>
                  {item.etatSalle && (
                    <Badge variant={item.etatSalle === 'BON' ? 'success' : item.etatSalle === 'MOYEN' ? 'warning' : 'destructive'} className="text-[10px] px-1.5 py-0">
                      {item.etatSalle}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {item.nbEleveF + item.nbEleveG} élèves ({item.nbEleveF}F · {item.nbEleveG}G)
                  </span>
                  {item._count && (
                    <span className="text-muted-foreground">
                      {item._count.equipements} équip. · {item._count.ouvertures} ouv.
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end pt-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => router.push(`/responsable/salles/${item.idSalle}`)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelectedSalle(item); setDeleteModalOpen(true); }}
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

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
      </div>

      <SelectionBar
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setBulkDeleteModalOpen(true)}
        isDeleting={isDeleting}
        entityName="salle(s)"
      />

      <Modal open={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)} title="Confirmer la suppression groupée">
        <p className="text-sm text-muted-foreground">
          Supprimer <strong>{selectedIds.size}</strong> salle{selectedIds.size > 1 ? 's' : ''} ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleBulkDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-muted-foreground">
          Supprimer la salle <strong>{selectedSalle?.sigleSalle || `#${selectedSalle?.idSalle}`}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
