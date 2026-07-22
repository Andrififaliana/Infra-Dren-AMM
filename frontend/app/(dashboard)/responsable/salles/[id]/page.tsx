'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DoorOpen, Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { useSalle, useUpdateSalle } from '@/hooks/use-salles';
import { useCreateOuverture, useUpdateOuverture, useDeleteOuverture } from '@/hooks/use-gestion-batiment-salle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { GenericPhotoUpload } from '@/components/shared/generic-photo-upload';
import type { Ouverture, SallePhoto } from '@/types/salle';

export default function EditSallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const salleId = Number(id);
  const { data: salle, isLoading } = useSalle(salleId);
  const { mutate: updateSalle, isPending } = useUpdateSalle(salleId);

  // Ouvertures
  const { mutate: createOuverture } = useCreateOuverture(salleId);
  const { mutate: updateOuverture } = useUpdateOuverture(salleId);
  const { mutate: deleteOuverture } = useDeleteOuverture(salleId);

  const [ouvModalOpen, setOuvModalOpen] = useState(false);
  const [editOuv, setEditOuv] = useState<Ouverture | null>(null);
  const [delOuvModalOpen, setDelOuvModalOpen] = useState(false);
  const [delOuvTarget, setDelOuvTarget] = useState<Ouverture | null>(null);
  const [estOperationnel, setEstOperationnel] = useState(false);
  const [estElectrifiee, setEstElectrifiee] = useState(false);

  // Sync checkbox state when data loads
  useEffect(() => {
    if (salle) {
      setEstOperationnel(salle.estOperationnel);
      setEstElectrifiee(salle.estElectrifiee);
    }
  }, [salle]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      sigleSalle: (form.get('sigleSalle') as string) || undefined,
      niveauSalle: Number(form.get('niveauSalle')),
      affectationSalle: (form.get('affectationSalle') as string) || undefined,
      etatSalle: (form.get('etatSalle') as string) || undefined,
      estOperationnel,
      estElectrifiee,
      nbEleveF: Number(form.get('nbEleveF')) || 0,
      nbEleveG: Number(form.get('nbEleveG')) || 0,
    };
    updateSalle(data, {
      onSuccess: () => { toast.success('Salle modifiée'); router.push('/responsable/salles'); },
      onError: () => toast.error('Erreur lors de la modification'),
    });
  };

  const openOuvModal = (ouverture?: Ouverture) => {
    setEditOuv(ouverture ?? null);
    setOuvModalOpen(true);
  };

  const handleSaveOuverture = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dto = {
      typeOuvert: (form.get('typeOuvert') as string) || undefined,
      nbOuvert: Number(form.get('nbOuvert')) || 0,
      largeurOuvert: Number(form.get('largeurOuvert')) || undefined,
      hauteurOuvert: Number(form.get('hauteurOuvert')) || undefined,
      surfaceOuvert: Number(form.get('surfaceOuvert')) || undefined,
    };

    if (editOuv) {
      updateOuverture({ id: editOuv.idOuvert, dto }, {
        onSuccess: () => { toast.success('Ouverture modifiée'); setOuvModalOpen(false); },
        onError: () => toast.error('Erreur'),
      });
    } else {
      createOuverture(dto, {
        onSuccess: () => { toast.success('Ouverture ajoutée'); setOuvModalOpen(false); },
        onError: () => toast.error('Erreur'),
      });
    }
  };

  if (isLoading) return <div className="mx-auto max-w-2xl"><Skeleton className="h-96" /></div>;
  if (!salle) return <div className="py-16 text-center"><p className="text-muted-foreground">Salle non trouvée</p></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Modifier : {salle.sigleSalle || `Salle #${salle.idSalle}`}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" key={salle.idSalle}>
            <Input id="sigleSalle" name="sigleSalle" label="Sigle" defaultValue={salle.sigleSalle ?? ''} />
            <Input id="niveauSalle" name="niveauSalle" label="Niveau" type="number" defaultValue={salle.niveauSalle} />
            <div className="grid grid-cols-2 gap-4">
              <Select id="affectationSalle" name="affectationSalle" label="Affectation" defaultValue={salle.affectationSalle ?? ''}
                options={[{ value: '', label: 'Sélectionner' }, { value: 'CLASSE', label: 'Classe' }, { value: 'LABORATOIRE', label: 'Laboratoire' }, { value: 'ADMINISTRATION', label: 'Administration' }, { value: 'BIBLIOTHEQUE', label: 'Bibliothèque' }]}
              />
              <Select id="etatSalle" name="etatSalle" label="État" defaultValue={salle.etatSalle ?? ''}
                options={[{ value: '', label: 'Sélectionner' }, { value: 'BON', label: 'Bon' }, { value: 'MOYEN', label: 'Moyen' }, { value: 'MAUVAIS', label: 'Mauvais' }]}
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={estOperationnel} onCheckedChange={(c) => setEstOperationnel(c === true)} />
                Opérationnel
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={estElectrifiee} onCheckedChange={(c) => setEstElectrifiee(c === true)} />
                Électrifiée
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="nbEleveF" name="nbEleveF" label="Élèves (F)" type="number" defaultValue={salle.nbEleveF} />
              <Input id="nbEleveG" name="nbEleveG" label="Élèves (G)" type="number" defaultValue={salle.nbEleveG} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>Annuler</Button>
              <Button type="submit" loading={isPending}>Enregistrer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Section Photos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GenericPhotoUpload
            entityId={salle.idSalle}
            apiBasePath="/salles"
            queryKey={['salles', salle.idSalle]}
            photos={(salle as any).photos as SallePhoto[]}
            entityName="cette salle"
          />
        </CardContent>
      </Card>

      {/* Section Ouvertures */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-muted-foreground" />
            Fenêtres &amp; Portes
          </CardTitle>
          <Button size="sm" onClick={() => openOuvModal()}>
            <Plus className="mr-1 h-4 w-4" /> Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {(!salle.ouvertures || salle.ouvertures.length === 0) ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucune ouverture enregistrée</p>
          ) : (
            <div className="space-y-2">
              {salle.ouvertures.map((ouv) => (
                <div key={ouv.idOuvert} className="group flex items-center justify-between rounded-lg border px-4 py-3 hover:border-primary/20 hover:bg-primary/5 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {ouv.nbOuvert}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{ouv.typeOuvert || 'Ouverture'}</p>
                      <p className="text-xs text-muted-foreground">
                        {ouv.largeurOuvert && ouv.hauteurOuvert
                          ? `${ouv.largeurOuvert}×${ouv.hauteurOuvert} m (${ouv.surfaceOuvert} m²)`
                          : 'Dimensions non spécifiées'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openOuvModal(ouv)} className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setDelOuvTarget(ouv); setDelOuvModalOpen(true); }} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Ouverture */}
      <Modal open={ouvModalOpen} onClose={() => setOuvModalOpen(false)} title={editOuv ? "Modifier l'ouverture" : 'Ajouter une ouverture'} size="xl">
        <form onSubmit={handleSaveOuverture} className="space-y-4 p-6" key={editOuv?.idOuvert ?? 'new'}>
          <Select id="typeOuvert" name="typeOuvert" label="Type" defaultValue={editOuv?.typeOuvert ?? ''}
            options={[{ value: '', label: 'Sélectionner' }, { value: 'FENETRE', label: 'Fenêtre' }, { value: 'PORTE', label: 'Porte' }, { value: 'FENETRE_PORTE', label: 'Fenêtre-Porte' }]}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input id="nbOuvert" name="nbOuvert" label="Nombre" type="number" defaultValue={editOuv?.nbOuvert ?? 0} />
            <Input id="largeurOuvert" name="largeurOuvert" label="Largeur (m)" type="number" step="0.1" defaultValue={editOuv?.largeurOuvert ?? ''} />
            <Input id="hauteurOuvert" name="hauteurOuvert" label="Hauteur (m)" type="number" step="0.1" defaultValue={editOuv?.hauteurOuvert ?? ''} />
          </div>
          <Input id="surfaceOuvert" name="surfaceOuvert" label="Surface (m²)" type="number" step="0.1" defaultValue={editOuv?.surfaceOuvert ?? ''} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setOuvModalOpen(false)}>Annuler</Button>
            <Button type="submit">{editOuv ? 'Modifier' : 'Ajouter'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmation suppression ouverture */}
      <Modal open={delOuvModalOpen} onClose={() => setDelOuvModalOpen(false)} title="Supprimer l'ouverture ?">
        <p className="mb-6 text-sm text-muted-foreground">Cette action est irréversible.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDelOuvModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={() => {
            if (delOuvTarget) {
              deleteOuverture(delOuvTarget.idOuvert, {
                onSuccess: () => { toast.success('Ouverture supprimée'); setDelOuvModalOpen(false); setDelOuvTarget(null); },
                onError: () => toast.error('Erreur'),
              });
            }
          }}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}
