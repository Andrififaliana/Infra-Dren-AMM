'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { useCreateEquipement } from '@/hooks/use-equipements';
import { useSalles } from '@/hooks/use-salles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { equipementSchema } from '@/lib/validations';

export default function NouvelEquipementPage() {
  const router = useRouter();
  const { mutate: createEquip, isPending } = useCreateEquipement();
  const { data: salles } = useSalles();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const data = {
      nomEquip: form.get('nomEquip') as string,
      typeEquip: (form.get('typeEquip') as string) || undefined,
      etat: (form.get('etat') as string) || undefined,
      quantite: Number(form.get('quantite')) || 1,
      salleId: Number(form.get('salleId')),
    };

    const result = equipementSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    createEquip(result.data, {
      onSuccess: () => { toast.success("Équipement créé"); router.push('/responsable/equipements'); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Nouvel équipement</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="nomEquip" name="nomEquip" label="Nom de l'équipement *" required />
            {errors.nomEquip && <p className="text-xs text-destructive">{errors.nomEquip}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Select id="typeEquip" name="typeEquip" label="Type"
                options={[{ value: '', label: 'Sélectionner' }, { value: 'MOBILIER', label: 'Mobilier' }, { value: 'MATERIEL_DIDACTIQUE', label: 'Didactique' }, { value: 'MATERIEL_SCIENTIFIQUE', label: 'Scientifique' }, { value: 'INFORMATIQUE', label: 'Informatique' }]}
              />
              <Select id="etat" name="etat" label="État"
                options={[{ value: '', label: 'Sélectionner' }, { value: 'BON', label: 'Bon' }, { value: 'MOYEN', label: 'Moyen' }, { value: 'MAUVAIS', label: 'Mauvais' }]}
              />
            </div>
            <Input id="quantite" name="quantite" label="Quantité" type="number" min="1" defaultValue="1" />
            <Select id="salleId" name="salleId" label="Salle *" required
              options={(salles ?? []).map((s) => ({ value: String(s.idSalle), label: s.sigleSalle || `Salle #${s.idSalle}` }))}
            />
            {errors.salleId && <p className="text-xs text-destructive">{errors.salleId}</p>}
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
