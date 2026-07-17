'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSalle, useUpdateSalle } from '@/hooks/use-salles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditSallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: salle, isLoading } = useSalle(Number(id));
  const { mutate: updateSalle, isPending } = useUpdateSalle(Number(id));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      sigleSalle: (form.get('sigleSalle') as string) || undefined,
      niveauSalle: Number(form.get('niveauSalle')),
      affectationSalle: (form.get('affectationSalle') as string) || undefined,
      etatSalle: (form.get('etatSalle') as string) || undefined,
      estOperationnel: form.get('estOperationnel') === 'on',
      estElectrifiee: form.get('estElectrifiee') === 'on',
      nbEleveF: Number(form.get('nbEleveF')) || 0,
      nbEleveG: Number(form.get('nbEleveG')) || 0,
    };
    updateSalle(data, {
      onSuccess: () => { toast.success('Salle modifiée'); router.push('/responsable/salles'); },
      onError: () => toast.error('Erreur lors de la modification'),
    });
  };

  if (isLoading) return <div className="mx-auto max-w-2xl"><Skeleton className="h-96" /></div>;
  if (!salle) return <div className="py-16 text-center"><p className="text-gray-500">Salle non trouvée</p></div>;

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
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="estOperationnel" defaultChecked={salle.estOperationnel} className="rounded" /> Opérationnel</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="estElectrifiee" defaultChecked={salle.estElectrifiee} className="rounded" /> Électrifiée</label>
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
    </div>
  );
}
