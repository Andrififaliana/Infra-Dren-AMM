'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { useCreateTrajet } from '@/hooks/use-trajets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trajetSchema } from '@/lib/validations';

export default function NouveauTrajetPage() {
  const router = useRouter();
  const { mutate: createTrajet, isPending } = useCreateTrajet();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const data = {
      nomTrajet: form.get('nomTrajet') as string,
      debutTrajet: form.get('debutTrajet') as string,
      finTrajet: form.get('finTrajet') as string,
      moyensData: {
        typeMoyen: form.get('typeMoyen') as string,
        dureeMoyen: form.get('dureeMoyen') ? Number(form.get('dureeMoyen')) : undefined,
        distanceMoyen: form.get('distanceMoyen') ? Number(form.get('distanceMoyen')) : undefined,
      },
      periodeData: form.get('debutPeriode') ? {
        debutPeriode: form.get('debutPeriode') as string,
        finPeriode: form.get('finPeriode') as string,
      } : undefined,
    };

    const result = trajetSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    createTrajet(result.data as any, {
      onSuccess: () => { toast.success('Trajet créé'); router.push('/responsable/trajets'); },
      onError: () => toast.error('Erreur lors de la création'),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Nouveau trajet</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="nomTrajet" name="nomTrajet" label="Nom du trajet *" placeholder="Ex: Antananarivo → Ambohimanarina" required />
            {errors.nomTrajet && <p className="text-xs text-red-500">{errors.nomTrajet}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Input id="debutTrajet" name="debutTrajet" label="Début *" type="date" required />
              <Input id="finTrajet" name="finTrajet" label="Fin *" type="date" required />
            </div>
            {errors.debutTrajet && <p className="text-xs text-red-500">{errors.debutTrajet}</p>}
            {errors.finTrajet && <p className="text-xs text-red-500">{errors.finTrajet}</p>}
            <div className="border-t pt-4">
              <p className="mb-3 text-sm font-medium text-gray-700">Moyen de transport</p>
              <div className="grid grid-cols-3 gap-4">
                <Select id="typeMoyen" name="typeMoyen" label="Type *" required
                  options={[{ value: '', label: 'Sélectionner' }, { value: 'BUS', label: 'Bus' }, { value: 'TAXI-BROUSSE', label: 'Taxi-brousse' }, { value: 'PIED', label: 'À pied' }, { value: 'MOTO', label: 'Moto' }]}
                />
                {errors.typeMoyen && <p className="text-xs text-red-500">{errors.typeMoyen}</p>}
                <Input id="dureeMoyen" name="dureeMoyen" label="Durée (min)" type="number" min="0" />
                <Input id="distanceMoyen" name="distanceMoyen" label="Distance (km)" type="number" step="0.1" min="0" />
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="mb-3 text-sm font-medium text-gray-700">Période difficile (optionnelle)</p>
              <div className="grid grid-cols-2 gap-4">
                <Input id="debutPeriode" name="debutPeriode" label="Début période" type="date" />
                <Input id="finPeriode" name="finPeriode" label="Fin période" type="date" />
              </div>
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
