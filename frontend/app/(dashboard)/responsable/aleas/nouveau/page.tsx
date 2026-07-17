'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { useCreateAlea } from '@/hooks/use-aleas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aleaSchema } from '@/lib/validations';

export default function NouvelAleaPage() {
  const router = useRouter();
  const { mutate: createAlea, isPending } = useCreateAlea();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const data = {
      nomAleat: (form.get('nomAleat') as string) || undefined,
      typeAleat: (form.get('typeAleat') as string) || undefined,
      dateAleat: (form.get('dateAleat') as string) || undefined,
      explication: (form.get('explication') as string) || undefined,
    };

    const result = aleaSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    createAlea(result.data, {
      onSuccess: () => { toast.success('Aléa créé'); router.push('/responsable/aleas'); },
      onError: () => toast.error("Erreur lors de la création de l'aléa"),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Nouvel aléa</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="nomAleat" name="nomAleat" label="Nom de l'aléa *" placeholder="Ex: Inondation Ambohimanarina" required />
            {errors.nomAleat && <p className="text-xs text-red-500">{errors.nomAleat}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Input id="typeAleat" name="typeAleat" label="Type d'aléa *" placeholder="Ex: INONDATION" required />
              <Input id="dateAleat" name="dateAleat" label="Date *" type="date" required />
            </div>
            {errors.typeAleat && <p className="text-xs text-red-500">{errors.typeAleat}</p>}
            {errors.dateAleat && <p className="text-xs text-red-500">{errors.dateAleat}</p>}
            <div>
              <label htmlFor="explication" className="mb-1.5 block text-sm font-medium text-gray-700">Explication</label>
              <textarea id="explication" name="explication" rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="Description des impacts..."
              />
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
