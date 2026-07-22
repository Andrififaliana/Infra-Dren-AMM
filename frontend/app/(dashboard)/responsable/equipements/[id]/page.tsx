'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEquipement, useUpdateEquipement } from '@/hooks/use-equipements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditEquipementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: equip, isLoading } = useEquipement(Number(id));
  const { mutate: updateEquip, isPending } = useUpdateEquipement(Number(id));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      nomEquip: form.get('nomEquip') as string,
      typeEquip: (form.get('typeEquip') as string) || undefined,
      etat: (form.get('etat') as string) || undefined,
      quantite: Number(form.get('quantite')) || 1,
    };
    updateEquip(data, {
      onSuccess: () => { toast.success('Équipement modifié'); router.push('/responsable/equipements'); },
      onError: () => toast.error('Erreur lors de la modification'),
    });
  };

  if (isLoading) return <div className="mx-auto max-w-2xl"><Skeleton className="h-96" /></div>;
  if (!equip) return <div className="py-16 text-center"><p className="text-muted-foreground">Équipement non trouvé</p></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Modifier : {equip.nomEquip}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" key={equip.id}>
            <Input id="nomEquip" name="nomEquip" label="Nom" defaultValue={equip.nomEquip} required />
            <div className="grid grid-cols-2 gap-4">
              <Select id="typeEquip" name="typeEquip" label="Type" defaultValue={equip.typeEquip ?? ''}
                options={[{ value: '', label: 'Sélectionner' }, { value: 'MOBILIER', label: 'Mobilier' }, { value: 'MATERIEL_DIDACTIQUE', label: 'Didactique' }, { value: 'MATERIEL_SCIENTIFIQUE', label: 'Scientifique' }, { value: 'INFORMATIQUE', label: 'Informatique' }]}
              />
              <Select id="etat" name="etat" label="État" defaultValue={equip.etat ?? ''}
                options={[{ value: '', label: 'Sélectionner' }, { value: 'BON', label: 'Bon' }, { value: 'MOYEN', label: 'Moyen' }, { value: 'MAUVAIS', label: 'Mauvais' }]}
              />
            </div>
            <Input id="quantite" name="quantite" label="Quantité" type="number" min="1" defaultValue={equip.quantite} />
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
