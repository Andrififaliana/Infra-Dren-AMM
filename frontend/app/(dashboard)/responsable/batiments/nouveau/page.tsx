'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateBatiment } from '@/hooks/use-batiments';
import { useEtablissements } from '@/hooks/use-etablissements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { batimentSchema } from '@/lib/validations';
import { useState } from 'react';

export default function NouveauBatimentPage() {
  const router = useRouter();
  const { mutate: createBatiment, isPending } = useCreateBatiment();
  const { data: etabs } = useEtablissements({ limit: 100 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const data = {
      sigleBat: (form.get('sigleBat') as string) || undefined,
      nbNiveau: Number(form.get('nbNiveau')) || 0,
      etablissementId: Number(form.get('etablissementId')),
      srcFic: (form.get('srcFic') as string) || undefined,
      agenceC: (form.get('agenceC') as string) || undefined,
      dispositifAc: (form.get('dispositifAc') as string) || undefined,
      anneeRecProvC: (form.get('anneeRecProvC') as string) || undefined,
      anneeDefC: (form.get('anneeDefC') as string) || undefined,
    };

    const result = batimentSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    createBatiment(result.data, {
      onSuccess: () => {
        toast.success('Bâtiment créé avec succès');
        router.push('/responsable/batiments');
      },
      onError: () => toast.error('Erreur lors de la création'),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Nouveau bâtiment</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="sigleBat" name="sigleBat" label="Sigle du bâtiment" placeholder="Ex: BAT-A" />
            <Input id="nbNiveau" name="nbNiveau" label="Nombre de niveaux" type="number" min="0" />
            <Select
              id="etablissementId" name="etablissementId" label="Établissement *" required
              options={(etabs?.data ?? []).map((e) => ({ value: String(e.id), label: e.nomEtab }))}
            />
            {errors.etablissementId && <p className="text-xs text-destructive">{errors.etablissementId}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Input id="srcFic" name="srcFic" label="Source de financement" />
              <Input id="agenceC" name="agenceC" label="Agence de construction" />
            </div>
            <Input id="dispositifAc" name="dispositifAc" label="Dispositif anti-incendie" />
            <div className="grid grid-cols-2 gap-4">
              <Input id="anneeRecProvC" name="anneeRecProvC" label="Année provision" type="date" />
              <Input id="anneeDefC" name="anneeDefC" label="Année définition" type="date" />
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
