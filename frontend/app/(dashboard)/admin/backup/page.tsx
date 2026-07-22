'use client';

import { Database, Download, Shield } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function BackupPage() {
  const handleExportAll = async () => {
    try {
      const response = await apiClient.get('/backup/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Sauvegarde</h1>
        <p className="mt-1 text-sm text-muted-foreground">Exportez les données de l&apos;application</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Export complet</CardTitle>
                <CardDescription>Téléchargez toutes les données au format JSON</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-muted/30 p-4 mb-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Données incluses</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Établissements, bâtiments, salles, équipements, trajets, aléas, utilisateurs et journaux d&apos;audit.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleExportAll} size="lg">
              <Download className="mr-2 h-4 w-4" />
              Télécharger l&apos;export complet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
