'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEtablissement, useUpdateEtablissement } from '@/hooks/use-etablissements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditEtablissementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: etablissement, isLoading } = useEtablissement(Number(id));
  const { mutate: updateEtab, isPending, error } = useUpdateEtablissement(Number(id));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      nomEtab: form.get('nomEtab') as string,
      dren: form.get('dren') as string || undefined,
      cisco: form.get('cisco') as string || undefined,
      commune: form.get('commune') as string || undefined,
      fokontany: form.get('fokontany') as string || undefined,
      quartier: form.get('quartier') as string || undefined,
      couvTelephonique: form.get('couvTelephonique') === 'on',
      couvInternet: form.get('couvInternet') === 'on',
      nbEnseignantG: Number(form.get('nbEnseignantG')) || 0,
      nbEnseignantF: Number(form.get('nbEnseignantF')) || 0,
      nbSectionG: Number(form.get('nbSectionG')) || 0,
      nbSectionF: Number(form.get('nbSectionF')) || 0,
    };
    updateEtab(data, {
      onSuccess: () => router.push('/responsable/etablissements'),
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mb-4 h-8 w-1/3" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!etablissement) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Établissement non trouvé</p>
        <Button onClick={() => router.push('/responsable/etablissements')} className="mt-4">
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Modifier : {etablissement.nomEtab}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" key={etablissement.id}>
            <Input
              id="nomEtab" name="nomEtab" label="Nom de l'établissement *"
              defaultValue={etablissement.nomEtab} required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input id="dren" name="dren" label="DREN" defaultValue={etablissement.dren ?? ''} />
              <Input id="cisco" name="cisco" label="CISCO" defaultValue={etablissement.cisco ?? ''} />
            </div>
            <Input id="commune" name="commune" label="Commune" defaultValue={etablissement.commune ?? ''} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="fokontany" name="fokontany" label="Fokontany" defaultValue={etablissement.fokontany ?? ''} />
              <Input id="quartier" name="quartier" label="Quartier" defaultValue={etablissement.quartier ?? ''} />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="couvTelephonique" defaultChecked={etablissement.couvTelephonique} className="rounded" />
                Couverture téléphonique
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="couvInternet" defaultChecked={etablissement.couvInternet} className="rounded" />
                Couverture Internet
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="nbEnseignantG" name="nbEnseignantG" label="Enseignants (H)" type="number" defaultValue={etablissement.nbEnseignantG} />
              <Input id="nbEnseignantF" name="nbEnseignantF" label="Enseignants (F)" type="number" defaultValue={etablissement.nbEnseignantF} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="nbSectionG" name="nbSectionG" label="Sections (H)" type="number" defaultValue={etablissement.nbSectionG} />
              <Input id="nbSectionF" name="nbSectionF" label="Sections (F)" type="number" defaultValue={etablissement.nbSectionF} />
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error instanceof Error ? error.message : 'Erreur lors de la modification'}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" loading={isPending}>
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
