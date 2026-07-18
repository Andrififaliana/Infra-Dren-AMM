'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bath, Plus, Pencil, Trash2, Venus, Mars, GraduationCap, Droplets, DoorOpen, ChevronRight } from 'lucide-react';
import { useBatiment, useUpdateBatiment } from '@/hooks/use-batiments';
import { useCreateToilette, useUpdateToilette, useDeleteToilette } from '@/hooks/use-gestion-batiment-salle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import type { Toilette } from '@/types/batiment';

function getToiletteIcon(fonction?: string) {
  if (fonction === 'FILLES') return <Venus className="h-4 w-4 text-pink-500" />;
  if (fonction === 'GARCONS') return <Mars className="h-4 w-4 text-blue-500" />;
  if (fonction === 'ENSEIGNANTS') return <GraduationCap className="h-4 w-4 text-amber-600" />;
  if (fonction === 'LATRINES') return <Bath className="h-4 w-4 text-gray-500" />;
  return null;
}

export default function EditBatimentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const batimentId = Number(id);
  const { data: batiment, isLoading } = useBatiment(batimentId);
  const { mutate: updateBatiment, isPending } = useUpdateBatiment(batimentId);

  // Toilettes
  const { mutate: createToilette } = useCreateToilette(batimentId);
  const { mutate: updateToilette } = useUpdateToilette(batimentId);
  const { mutate: deleteToilette } = useDeleteToilette(batimentId);

  const [toilModalOpen, setToilModalOpen] = useState(false);
  const [editToil, setEditToil] = useState<Toilette | null>(null);
  const [delToilModalOpen, setDelToilModalOpen] = useState(false);
  const [delToilTarget, setDelToilTarget] = useState<Toilette | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      sigleBat: (form.get('sigleBat') as string) || undefined,
      nbNiveau: Number(form.get('nbNiveau')) || 0,
      srcFic: (form.get('srcFic') as string) || undefined,
      agenceC: (form.get('agenceC') as string) || undefined,
      dispositifAc: (form.get('dispositifAc') as string) || undefined,
    };
    updateBatiment(data, {
      onSuccess: () => { toast.success('Bâtiment modifié'); router.push('/responsable/batiments'); },
      onError: () => toast.error('Erreur lors de la modification'),
    });
  };

  const openToilModal = (toilette?: Toilette) => {
    setEditToil(toilette ?? null);
    setToilModalOpen(true);
  };

  const handleSaveToilette = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dto = {
      nbCompartiment: Number(form.get('nbCompartiment')) || 0,
      fonctionToilette: (form.get('fonctionToilette') as string) || undefined,
      pointEau: form.get('pointEau') === 'on',
    };

    if (editToil) {
      updateToilette({ id: editToil.idToilette, dto }, {
        onSuccess: () => { toast.success('Toilette modifiée'); setToilModalOpen(false); },
        onError: () => toast.error('Erreur'),
      });
    } else {
      createToilette(dto, {
        onSuccess: () => { toast.success('Toilette ajoutée'); setToilModalOpen(false); },
        onError: () => toast.error('Erreur'),
      });
    }
  };

  if (isLoading) return <div className="mx-auto max-w-2xl"><Skeleton className="h-96" /></div>;
  if (!batiment) return <div className="py-16 text-center"><p className="text-gray-500">Bâtiment non trouvé</p></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Modifier : {batiment.sigleBat || `Bâtiment #${batiment.idBat}`}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" key={batiment.idBat}>
            <Input id="sigleBat" name="sigleBat" label="Sigle" defaultValue={batiment.sigleBat ?? ''} />
            <Input id="nbNiveau" name="nbNiveau" label="Niveaux" type="number" defaultValue={batiment.nbNiveau} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="srcFic" name="srcFic" label="Source" defaultValue={batiment.srcFic ?? ''} />
              <Input id="agenceC" name="agenceC" label="Agence" defaultValue={batiment.agenceC ?? ''} />
            </div>
            <Input id="dispositifAc" name="dispositifAc" label="Dispositif AC" defaultValue={batiment.dispositifAc ?? ''} />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>Annuler</Button>
              <Button type="submit" loading={isPending}>Enregistrer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Section Salles */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-gray-500" />
            Salles ({batiment.salles?.length ?? 0})
          </CardTitle>
          <Button size="sm" onClick={() => router.push('/responsable/salles/nouveau')}>
            <Plus className="mr-1 h-4 w-4" /> Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {(!batiment.salles || batiment.salles.length === 0) ? (
            <p className="py-6 text-center text-sm text-gray-400">Aucune salle enregistrée</p>
          ) : (
            <div className="space-y-2">
              {batiment.salles.map((salle) => (
                <div
                  key={salle.idSalle}
                  className="group flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition-all hover:border-green-200 hover:bg-green-50/50"
                  onClick={() => router.push(`/responsable/salles/${salle.idSalle}`)}
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                      {salle.niveauSalle}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{salle.sigleSalle || `Salle #${salle.idSalle}`}</p>
                      <p className="text-xs text-gray-500">
                        {salle.affectationSalle || 'Non spécifiée'}
                        {salle.estOperationnel ? ' · Opérationnelle' : ' · Non opérationnelle'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-green-500" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Toilettes */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bath className="h-5 w-5 text-gray-500" />
            Toilettes / Latrines
          </CardTitle>
          <Button size="sm" onClick={() => openToilModal()}>
            <Plus className="mr-1 h-4 w-4" /> Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {(!batiment.toilettes || batiment.toilettes.length === 0) ? (
            <p className="py-6 text-center text-sm text-gray-400">Aucune toilette enregistrée</p>
          ) : (
            <div className="space-y-2">
              {batiment.toilettes.map((toil) => (
                <div key={toil.idToilette} className="group flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:border-green-200 hover:bg-green-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                      {toil.nbCompartiment}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        {getToiletteIcon(toil.fonctionToilette)}
                        <span>{toil.fonctionToilette === 'FILLES' ? 'Filles' :
                         toil.fonctionToilette === 'GARCONS' ? 'Garçons' :
                         toil.fonctionToilette === 'ENSEIGNANTS' ? 'Enseignants' :
                         toil.fonctionToilette === 'LATRINES' ? 'Latrines' :
                         toil.fonctionToilette || 'Toilette'}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {toil.nbCompartiment} compartiment{toil.nbCompartiment > 1 ? 's' : ''}
                         · {toil.pointEau ? <Droplets className="h-3.5 w-3.5 text-blue-400 inline mr-1" /> : null}
                        {toil.pointEau ? "Point d'eau" : "Sans point d'eau"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openToilModal(toil)} className="rounded-lg p-2 text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setDelToilTarget(toil); setDelToilModalOpen(true); }} className="rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Toilette */}
      <Modal open={toilModalOpen} onClose={() => setToilModalOpen(false)} title={editToil ? 'Modifier la toilette' : 'Ajouter une toilette'}>
        <form onSubmit={handleSaveToilette} className="space-y-4" key={editToil?.idToilette ?? 'new'}>
          <div className="grid grid-cols-2 gap-4">
            <Input id="nbCompartiment" name="nbCompartiment" label="Compartiments" type="number" defaultValue={editToil?.nbCompartiment ?? 0} />
            <Select id="fonctionToilette" name="fonctionToilette" label="Fonction" defaultValue={editToil?.fonctionToilette ?? ''}
              options={[
                { value: '', label: 'Sélectionner' },
                { value: 'FILLES', label: '🚺 Filles' },
                { value: 'GARCONS', label: '🚹 Garçons' },
                { value: 'ENSEIGNANTS', label: '👨‍🏫 Enseignants' },
                { value: 'LATRINES', label: '🚽 Latrines' },
              ]}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="pointEau" defaultChecked={editToil?.pointEau ?? false} className="rounded" />
            Point d&apos;eau disponible
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setToilModalOpen(false)}>Annuler</Button>
            <Button type="submit">{editToil ? 'Modifier' : 'Ajouter'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmation suppression toilette */}
      <Modal open={delToilModalOpen} onClose={() => setDelToilModalOpen(false)} title="Supprimer cette toilette ?">
        <p className="mb-6 text-sm text-gray-600">Cette action est irréversible.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDelToilModalOpen(false)}>Annuler</Button>
          <Button variant="danger" onClick={() => {
            if (delToilTarget) {
              deleteToilette(delToilTarget.idToilette, {
                onSuccess: () => { toast.success('Toilette supprimée'); setDelToilModalOpen(false); setDelToilTarget(null); },
                onError: () => toast.error('Erreur'),
              });
            }
          }}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
