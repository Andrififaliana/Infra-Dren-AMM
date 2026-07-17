'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useBatiment, useUpdateBatiment } from '@/hooks/use-batiments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBatimentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: batiment, isLoading } = useBatiment(Number(id));
  const { mutate: updateBatiment, isPending } = useUpdateBatiment(Number(id));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      sigleBat: (form.get('sigleBat') as string) || undefined,
      nbNiveau: Number(form.get('nbNiveau')) || 0,
      srcFic: (form.get('srcFic') as string) || undefined,
      agenceC: (form.get('agenceC') as string) || undefined,
      dispositifAc: (form.get('dispositifAc') as string) || undefined,
    };
    updateBatiment(data, {
      onSuccess: () => { toast.success('Bâtiment modifié'); router.push('/responsable/batiments'); },
      onError: () => toast.error('Erreur lors de la modification'),
    });
  };

  if (isLoading) return <div className="mx-auto max-w-2xl"><Skeleton className="h-96" /></div>;
  if (!batiment) return <div className="py-16 text-center"><p className="text-gray-500">Bâtiment non trouvé</p></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Retour</Button>
      <Card>
        <CardHeader><CardTitle>Modifier : {batiment.sigleBat || `Bâtiment #${batiment.idBat}`}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" key={batiment.idBat}>
            <Input id="sigleBat" name="sigleBat" label="Sigle" defaultValue={batiment.sigleBat ?? ''} />
            <Input id="nbNiveau" name="nbNiveau" label="Niveaux" type="number" defaultValue={batiment.nbNiveau} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="srcFic" name="srcFic" label="Source" defaultValue={batiment.srcFic ?? ''} />
              <Input id="agenceC" name="agenceC" label="Agence" defaultValue={batiment.agenceC ?? ''} />
            </div>
            <Input id="dispositifAc" name="dispositifAc" label="Dispositif AC" defaultValue={batiment.dispositifAc ?? ''} />
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
