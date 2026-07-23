'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/shared/pagination';
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
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const limit = 15;

  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ['logs', actionFilter, page],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<LogsResponse>>('/logs', {
        params: { page, limit, ...(actionFilter ? { action: actionFilter } : {}) },
      });
      return data.data;
    },
  });

  const logs = logsResponse?.data ?? [];
  const meta = logsResponse?.meta;

  const actionBadge = (action: string) => {
    const map: Record<string, 'success' | 'warning' | 'destructive' | 'info'> = {
      CREATION: 'success',
      MODIFICATION: 'warning',
      SUPPRESSION: 'destructive',
    };
    return map[action] || 'default';
  };

  const actions = [
    { value: '', label: 'Toutes' },
    { value: 'CREATE', label: 'Création' },
    { value: 'UPDATE', label: 'Modification' },
    { value: 'DELETE', label: 'Suppression' },
    { value: 'LOGIN', label: 'Connexion' },
  ];

  const handleFilterChange = (value: string) => {
    setActionFilter(value);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Journal d&apos;audit</h1>
        <p className="mt-1 text-sm text-muted-foreground">Trace de toutes les actions effectuées</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Journal d&apos;audit</CardTitle>
            <div className="flex items-center gap-1.5 flex-wrap">
              {actions.map((a) => (
                <button
                  key={a.value}
                  onClick={() => handleFilterChange(a.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    actionFilter === a.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
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

          {meta && (
            <div className="mt-4">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
