'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateEtablissement } from '@/hooks/use-etablissements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export default function NouvelEtablissementPage() {
  const router = useRouter();
  const { mutate: createEtab, isPending, error } = useCreateEtablissement();
  const [couvTelephonique, setCouvTelephonique] = useState(false);
  const [couvInternet, setCouvInternet] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      nomEtab: form.get('nomEtab') as string,
      dren: form.get('dren') as string || undefined,
      cisco: form.get('cisco') as string || undefined,
      zap: form.get('zap') as string || undefined,
      commune: form.get('commune') as string || undefined,
      fokontany: form.get('fokontany') as string || undefined,
      quartier: form.get('quartier') as string || undefined,
      couvTelephonique,
      couvInternet,
      nbEnseignantG: Number(form.get('nbEnseignantG')) || 0,
      nbEnseignantF: Number(form.get('nbEnseignantF')) || 0,
      nbSectionG: Number(form.get('nbSectionG')) || 0,
      nbSectionF: Number(form.get('nbSectionF')) || 0,
    };
    createEtab(data, {
      onSuccess: () => router.push('/responsable/etablissements'),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nouvel établissement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="nomEtab" name="nomEtab" label="Nom de l'établissement *" required />
            <div className="grid grid-cols-2 gap-4">
              <Input id="dren" name="dren" label="DREN" />
              <Input id="cisco" name="cisco" label="CISCO" />
            </div>
            <Input id="zap" name="zap" label="ZAP" />
            <Input id="commune" name="commune" label="Commune" />
            <div className="grid grid-cols-2 gap-4">
              <Input id="fokontany" name="fokontany" label="Fokontany" />
              <Input id="quartier" name="quartier" label="Quartier" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={couvTelephonique} onCheckedChange={(c) => setCouvTelephonique(c === true)} />
                Couverture téléphonique
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={couvInternet} onCheckedChange={(c) => setCouvInternet(c === true)} />
                Couverture Internet
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="nbEnseignantG" name="nbEnseignantG" label="Enseignants (H)" type="number" min="0" />
              <Input id="nbEnseignantF" name="nbEnseignantF" label="Enseignants (F)" type="number" min="0" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="nbSectionG" name="nbSectionG" label="Sections (H)" type="number" min="0" />
              <Input id="nbSectionF" name="nbSectionF" label="Sections (F)" type="number" min="0" />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error instanceof Error ? error.message : 'Erreur lors de la création'}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" loading={isPending}>
                Créer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
