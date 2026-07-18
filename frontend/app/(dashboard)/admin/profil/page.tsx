'use client';

import { toast } from 'sonner';
import { User, Mail, Shield, KeyRound } from 'lucide-react';
import { useProfile } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  RESPONSABLE_INFRASTRUCTURE: 'Responsable Infrastructure',
};

export default function AdminProfilPage() {
  const { data: user, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Profil' }]} />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Profil' }]} />
        <div className="py-16 text-center">
          <p className="text-gray-500">Impossible de charger le profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumb items={[{ label: 'Profil' }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="mt-1 text-sm text-gray-500">
          Informations personnelles et sécurité
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
              {user.nom.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.nom}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-100 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                <Mail className="h-3.5 w-3.5" /> Email
              </div>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                <Shield className="h-3.5 w-3.5" /> Rôle
              </div>
              <p className="text-sm font-medium text-gray-900">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                <KeyRound className="h-3.5 w-3.5" /> Compte créé le
              </div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                <Shield className="h-3.5 w-3.5" /> Statut
              </div>
              <p className="text-sm font-medium text-green-700">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium">
                  ● {user.actif ? 'Actif' : 'Inactif'}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-green-500" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Le changement de mot de passe est géré par Supabase Auth.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              toast.success('Un email de réinitialisation vous sera envoyé.');
            }}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Demander la réinitialisation du mot de passe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
