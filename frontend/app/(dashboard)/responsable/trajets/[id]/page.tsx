'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTrajet, useUpdateTrajet } from '@/hooks/use-trajets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditTrajetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: trajet, isLoading } = useTrajet(Number(id));
  const { mutate: updateTrajet, isPending } = useUpdateTrajet(Number(id));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      nomTrajet: (form.get('nomTrajet') as string) || undefined,
      debutTrajet: (form.get('debutTrajet') as string) || undefined,
      finTrajet: (form.get('finTrajet') as string) || undefined,
    };
    updateTrajet(data, {
      onSuccess: () => { toast.success('Trajet modifié'); router.push('/responsable/trajets'); },
      onError: () => toast.error('Erreur lors de la modification'),
    });
  };

  if (isLoading) return <div className="mx-auto max-w-2xl"><Skeleton className="h-96" /></div>;
  if (!trajet) return <div className="py-16 text-center"><p className="text-muted-foreground">Trajet non trouvé</p></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Modifier : {trajet.nomTrajet || `Trajet #${trajet.idTrajet}`}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" key={trajet.idTrajet}>
            <Input id="nomTrajet" name="nomTrajet" label="Nom" defaultValue={trajet.nomTrajet ?? ''} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="debutTrajet" name="debutTrajet" label="Début" type="date" defaultValue={trajet.debutTrajet ? new Date(trajet.debutTrajet).toISOString().split('T')[0] : ''} />
              <Input id="finTrajet" name="finTrajet" label="Fin" type="date" defaultValue={trajet.finTrajet ? new Date(trajet.finTrajet).toISOString().split('T')[0] : ''} />
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
