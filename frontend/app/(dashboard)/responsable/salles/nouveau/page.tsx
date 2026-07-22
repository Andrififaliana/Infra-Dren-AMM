'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { useCreateSalle } from '@/hooks/use-salles';
import { useBatiments } from '@/hooks/use-batiments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { salleSchema } from '@/lib/validations';

export default function NouvelleSallePage() {
  const router = useRouter();
  const { mutate: createSalle, isPending } = useCreateSalle();
  const { data: batiments } = useBatiments();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const data = {
      sigleSalle: (form.get('sigleSalle') as string) || undefined,
      niveauSalle: Number(form.get('niveauSalle')),
      batimentId: Number(form.get('batimentId')),
      affectationSalle: (form.get('affectationSalle') as string) || undefined,
      etatSalle: (form.get('etatSalle') as string) || undefined,
      estOperationnel: form.get('estOperationnel') === 'on',
      estElectrifiee: form.get('estElectrifiee') === 'on',
      longueurInt: Number(form.get('longueurInt')) || undefined,
      hauteurSP: Number(form.get('hauteurSP')) || undefined,
      nbEleveF: Number(form.get('nbEleveF')) || 0,
      nbEleveG: Number(form.get('nbEleveG')) || 0,
    };

    const result = salleSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    createSalle(result.data, {
      onSuccess: () => { toast.success('Salle créée'); router.push('/responsable/salles'); },
      onError: () => toast.error('Erreur lors de la création'),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Nouvelle salle</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="sigleSalle" name="sigleSalle" label="Sigle" placeholder="Ex: CLASSE-01" />
            <Input id="niveauSalle" name="niveauSalle" label="Niveau" type="number" min="0" required />
            {errors.niveauSalle && <p className="text-xs text-destructive">{errors.niveauSalle}</p>}
            <Select id="batimentId" name="batimentId" label="Bâtiment *" required
              options={(batiments ?? []).map((b) => ({ value: String(b.idBat), label: b.sigleBat || `#${b.idBat}` }))}
            />
            {errors.batimentId && <p className="text-xs text-destructive">{errors.batimentId}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Select id="affectationSalle" name="affectationSalle" label="Affectation"
                options={[
                  { value: 'CLASSE', label: 'Classe' },
                  { value: 'LABORATOIRE', label: 'Laboratoire' },
                  { value: 'ADMINISTRATION', label: 'Administration' },
                  { value: 'BIBLIOTHEQUE', label: 'Bibliothèque' },
                ]}
              />
              <Select id="etatSalle" name="etatSalle" label="État"
                options={[
                  { value: 'BON', label: 'Bon' },
                  { value: 'MOYEN', label: 'Moyen' },
                  { value: 'MAUVAIS', label: 'Mauvais' },
                ]}
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="estOperationnel" className="rounded" /> Opérationnel</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="estElectrifiee" className="rounded" /> Électrifiée</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="longueurInt" name="longueurInt" label="Longueur (m)" type="number" step="0.1" />
              <Input id="hauteurSP" name="hauteurSP" label="Hauteur (m)" type="number" step="0.1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="nbEleveF" name="nbEleveF" label="Élèves (F)" type="number" min="0" />
              <Input id="nbEleveG" name="nbEleveG" label="Élèves (G)" type="number" min="0" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>Annuler</Button>
              <Button type="submit" loading={isPending}>Créer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
