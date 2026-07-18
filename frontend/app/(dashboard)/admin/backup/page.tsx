'use client';

import { Save } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sauvegarde</h1>
        <p className="mt-1 text-sm text-gray-500">Exportez les données de l&apos;application</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export complet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Téléchargez toutes les données de l&apos;application au format JSON.
            </p>
            <Button onClick={handleExportAll}>
              <Save className="mr-2 h-4 w-4" /> Télécharger l&apos;export complet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
