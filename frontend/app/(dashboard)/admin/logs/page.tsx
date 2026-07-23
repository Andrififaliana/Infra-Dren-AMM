'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateShort } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';

interface Log {
  id: number;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
  userId?: number;
  user?: { nom: string; email: string };
  createdAt: string;
}

interface LogsResponse {
  data: Log[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function LogsPage() {
  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<LogsResponse>>('/logs');
      return data.data;
    },
  });

  const logs = logsResponse?.data ?? [];

  const actionBadge = (action: string) => {
    const map: Record<string, 'success' | 'warning' | 'destructive' | 'info'> = {
      CREATION: 'success',
      MODIFICATION: 'warning',
      SUPPRESSION: 'destructive',
    };
    return map[action] || 'default';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Journal d&apos;audit</h1>
        <p className="mt-1 text-sm text-muted-foreground">Trace de toutes les actions effectuées</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={actionBadge(log.action)}>
                      {log.action}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {log.entity} {log.details ? `- ${log.details}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        par {log.user?.nom || 'Inconnu'} • {formatDateShort(log.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune activité</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
