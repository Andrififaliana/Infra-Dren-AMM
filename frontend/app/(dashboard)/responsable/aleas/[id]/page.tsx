'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAlea, useUpdateAlea } from '@/hooks/use-aleas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditAleaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: alea, isLoading } = useAlea(Number(id));
  const { mutate: updateAlea, isPending } = useUpdateAlea(Number(id));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      nomAleat: (form.get('nomAleat') as string) || undefined,
      typeAleat: (form.get('typeAleat') as string) || undefined,
      dateAleat: (form.get('dateAleat') as string) || undefined,
      explication: (form.get('explication') as string) || undefined,
    };
    updateAlea(data, {
      onSuccess: () => { toast.success("Aléa modifié"); router.push('/responsable/aleas'); },
      onError: () => toast.error("Erreur lors de la modification de l'aléa"),
    });
  };

  if (isLoading) return <div className="mx-auto max-w-2xl"><Skeleton className="h-96" /></div>;
  if (!alea) return <div className="py-16 text-center"><p className="text-muted-foreground">Aléa non trouvé</p></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Modifier : {alea.nomAleat || `Aléa #${alea.idAleat}`}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" key={alea.idAleat}>
            <Input id="nomAleat" name="nomAleat" label="Nom" defaultValue={alea.nomAleat ?? ''} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="typeAleat" name="typeAleat" label="Type" defaultValue={alea.typeAleat ?? ''} />
              <Input id="dateAleat" name="dateAleat" label="Date" type="date" defaultValue={alea.dateAleat ? new Date(alea.dateAleat).toISOString().split('T')[0] : ''} />
            </div>
            <div>
              <label htmlFor="explication" className="mb-1.5 block text-sm font-medium text-foreground">Explication</label>
              <textarea id="explication" name="explication" rows={3} defaultValue={alea.explication ?? ''}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
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
