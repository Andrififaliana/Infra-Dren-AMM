'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEtablissements, useDeleteEtablissement } from '@/hooks/use-etablissements';
import { DataTable, BooleanBadge } from '@/components/shared/data-table';
import { GridView, ViewToggle } from '@/components/shared/grid-view';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import {
  School, ImageIcon, Phone, Globe, Camera, Pencil, Trash2, Filter,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SelectionBar } from '@/components/shared/selection-bar';
import type { EtablissementListe } from '@/types/etablissement';

export default function GestionEtablissementsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [ciscoFilter, setCiscoFilter] = useState('');
  const [zapFilter, setZapFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEtab, setSelectedEtab] = useState<EtablissementListe | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');


  const { data, isLoading } = useEtablissements({
    page, limit: 10,
    search: search || undefined,
    cisco: ciscoFilter || undefined,
    zap: zapFilter || undefined,
  });
  const { mutate: deleteEtab, isPending: isDeleting } = useDeleteEtablissement();

  const etablissements = data?.data ?? [];
  const meta = data?.meta;

  const ciscoOptions = useMemo(() => {
    const unique = [...new Set(etablissements.map(e => e.cisco).filter(Boolean) as string[])];
    return unique.sort().map(v => ({ value: v, label: v }));
  }, [etablissements]);

  const zapOptions = useMemo(() => {
    const filtered = ciscoFilter
      ? etablissements.filter(e => e.cisco === ciscoFilter)
      : etablissements;
    const unique = [...new Set(filtered.map(e => e.zap).filter(Boolean) as string[])];
    return unique.sort().map(v => ({ value: v, label: v }));
  }, [etablissements, ciscoFilter]);

  const handleDelete = () => {
    if (selectedEtab) {
      deleteEtab(selectedEtab.id, {
        onSuccess: () => {
          toast.success('Établissement supprimé');
          setDeleteModalOpen(false);
          setSelectedEtab(null);
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
            deleteEtab(id, {
              onSuccess: () => resolve(),
              onError: reject,
            });
          })
      )
    ).then(() => {
      toast.success(`${selectedIds.size} établissement(s) supprimé(s)`);
      setBulkDeleteModalOpen(false);
      setSelectedIds(new Set());
    }).catch(() => toast.error('Erreur lors de la suppression groupée'));
  };

  const columns = [
    {
      key: 'photo',
      header: '',
      className: 'w-12',
      render: (item: EtablissementListe) => {
        const mainPhoto = item.photos?.find((p) => p.estPrincipale) ?? item.photos?.[0] ?? null;
        return (
          <div className="flex items-center justify-center">
            <div className="h-10 w-10 overflow-hidden rounded-xl">
              {mainPhoto ? (
                <img
                  src={mainPhoto.url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <School className="h-5 w-5 text-green-300/60" />
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    { key: 'nomEtab', header: 'Nom', className: 'min-w-[180px]' },
    { key: 'dren', header: 'DREN' },
    { key: 'cisco', header: 'CISCO' },
    { key: 'zap', header: 'ZAP' },
    { key: 'commune', header: 'Commune' },
    {
      key: 'couvTelephonique',
      header: <Phone className="h-4 w-4" />,
      render: (item: EtablissementListe) => <BooleanBadge value={item.couvTelephonique} />,
    },
    {
      key: 'couvInternet',
      header: <Globe className="h-4 w-4" />,
      render: (item: EtablissementListe) => <BooleanBadge value={item.couvInternet} />,
    },
    {
      key: 'photos',
      header: <Camera className="h-4 w-4" />,
      render: (item: EtablissementListe) => {
        const count = item._count?.photos ?? 0;
        return count > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <ImageIcon className="h-3.5 w-3.5" />
            {count}
          </span>
        ) : null;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: EtablissementListe) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/responsable/etablissements/${item.id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedEtab(item); setDeleteModalOpen(true); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Établissements</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">Gérer les établissements scolaires</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <Button onClick={() => router.push('/responsable/etablissements/nouveau')} size="sm" className="sm:size-md w-full sm:w-auto">
            + Nouvel établissement
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="w-full sm:flex-1" />
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto [-webkit-overflow-scrolling:touch] pb-1">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <Select
            value={ciscoFilter}
            onChange={(e) => { setCiscoFilter(e.target.value); setZapFilter(''); setPage(1); }}
            options={ciscoOptions}
            placeholder="Tous les CISCO"
            className="w-44 sm:w-56 shrink-0"
          />
          <Select
            value={zapFilter}
            onChange={(e) => { setZapFilter(e.target.value); setPage(1); }}
            options={zapOptions}
            placeholder="Toutes les ZAP"
            className="w-44 sm:w-56 shrink-0"
          />
        </div>
      </div>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={etablissements}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => router.push(`/responsable/etablissements/${item.id}`)}
          loading={isLoading}
          emptyMessage="Aucun établissement trouvé"
          selectable
          selectedIds={selectedIds}
          onSelectionChange={(ids) => setSelectedIds(ids as Set<number>)}
        />
      ) : (
        <GridView
          data={etablissements}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyMessage="Aucun établissement trouvé"
          renderCard={(item) => {
            const mainPhoto = item.photos?.find((p) => p.estPrincipale) ?? item.photos?.[0] ?? null;
            return (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                onClick={() => router.push(`/responsable/etablissements/${item.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-square"
              >
                {mainPhoto ? (
                  <img
                    src={mainPhoto.url}
                    alt={item.nomEtab}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <School className="h-20 w-20 text-green-300/60" />
                  </div>
                )}

                {/* Action buttons overlay - visible on hover */}
                <div
                  className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => router.push(`/responsable/etablissements/${item.id}`)}
                    className="rounded-lg bg-white/90 p-2 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setSelectedEtab(item); setDeleteModalOpen(true); }}
                    className="rounded-lg bg-white/90 p-2 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                  <p className="text-sm font-semibold text-white">{item.nomEtab}</p>
                  <p className="text-xs text-white/70">{item.dren || 'District'}</p>
                </div>
              </motion.div>
            );
          }}
        />
      )}

      {meta && (
        <div className="mt-4">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={setPage}
          />
        </div>
      )}

      <SelectionBar
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setBulkDeleteModalOpen(true)}
        isDeleting={isDeleting}
        entityName="établissement(s)"
      />

      <Modal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Confirmer la suppression groupée"
      >
        <p className="text-sm text-gray-600">
          Êtes-vous sûr de vouloir supprimer <strong>{selectedIds.size}</strong> établissement{selectedIds.size > 1 ? 's' : ''} ?
          Cette action est irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleBulkDelete} loading={isDeleting}>Supprimer</Button>
        </div>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmer la suppression"
      >
        <p className="text-sm text-gray-600">
          Êtes-vous sûr de vouloir supprimer <strong>{selectedEtab?.nomEtab}</strong> ?
          Cette action est irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
