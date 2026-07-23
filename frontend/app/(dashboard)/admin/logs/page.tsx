'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/pagination';
import {
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Hash,
  FileText,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import type { PaginatedResponse } from '@/types/api';

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

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  LOGIN: 'Connexion',
};

const actionBadge = (action: string) => {
  const map: Record<string, 'success' | 'warning' | 'destructive' | 'info'> = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'destructive',
    LOGIN: 'info',
  };
  return map[action] || 'default';
};



/** Tente de parser une chaîne JSON pour un affichage structuré */
function tryParseJson(str: string): { parsed: boolean; data: unknown } | null {
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object' && parsed !== null) {
      return { parsed: true, data: parsed };
    }
    return null;
  } catch {
    return null;
  }
}

/** Formate une date en français avec heure */
function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const ENTITY_ROUTES: Record<string, string> = {
  ETABLISSEMENT: '/responsable/etablissements',
  BATIMENT: '/responsable/batiments',
  SALLE: '/responsable/salles',
  EQUIPEMENT: '/responsable/equipements',
  TRAJET: '/responsable/trajets',
  ALEA: '/responsable/aleas',
};

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="mt-0.5 text-sm text-foreground break-words">{children}</div>
      </div>
    </div>
  );
}

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const limit = 15;

  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ['logs', actionFilter, page],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Log>>('/logs', {
        params: { page, limit, ...(actionFilter ? { action: actionFilter } : {}) },
      });
      return data;
    },
  });

  const logs = logsResponse?.data ?? [];
  const meta = logsResponse?.meta;

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
    setExpandedId(null);
  };

  const exportLogsCSV = async () => {
    setIsExporting(true);
    try {
      const { data } = await apiClient.get<PaginatedResponse<Log>>('/logs', {
        params: { page: 1, limit: 10000, ...(actionFilter ? { action: actionFilter } : {}) },
      });
      const allLogs = data.data ?? [];

      const headers = ['ID', 'Action', 'Entité', 'ID Entité', 'Détails', 'Utilisateur', 'Email', 'Date'];
      const rows = allLogs.map((log: Log) => [
        log.id,
        log.action,
        log.entity,
        log.entityId ?? '',
        log.details ?? '',
        log.user?.nom ?? 'Inconnu',
        log.user?.email ?? '',
        new Date(log.createdAt).toLocaleString('fr-FR'),
      ]);

      const csvContent = [
        headers.join(';'),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-audit-${actionFilter || 'tous'}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail — CSV export error is non-critical
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Journal d&apos;audit</h1>
          <p className="mt-1 text-sm text-muted-foreground">Trace de toutes les actions effectuées</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportLogsCSV} loading={isExporting} className="gap-2 shrink-0">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
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
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => {
                const isExpanded = expandedId === log.id;
                const detailsJson = log.details ? tryParseJson(log.details) : null;

                return (
                  <div key={log.id} className="rounded-lg border transition-all duration-200">
                    {/* Ligne compacte (toujours visible) */}
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">

                        <Badge variant={actionBadge(log.action)} className="shrink-0">
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            <span className="text-muted-foreground">{log.entity}</span>
                            {log.entityId != null && (
                              <span className="text-muted-foreground/60"> #{log.entityId}</span>
                            )}
                            {log.details && !detailsJson && (
                              <span className="text-muted-foreground/70 font-normal ml-1">
                                — {log.details}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground/60">
                            {log.user?.nom || 'Inconnu'} • {formatDateShort(log.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground/60" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
                        )}
                      </div>
                    </button>

                    {/* Panneau de détails déplié */}
                    {isExpanded && (
                      <div className="border-t px-4 py-4 space-y-3 bg-muted/20 rounded-b-lg animate-in slide-in-from-top-1 duration-150">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <DetailRow
                            icon={<Hash className="h-4 w-4" />}
                            label="ID Log"
                          >
                            <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">
                              #{log.id}
                            </span>
                          </DetailRow>

                          <DetailRow
                            icon={<Shield className="h-4 w-4" />}
                            label="Action"
                          >
                            <Badge variant={actionBadge(log.action)}>
                              {ACTION_LABELS[log.action] || log.action}
                            </Badge>
                          </DetailRow>

                          <DetailRow
                            icon={<FileText className="h-4 w-4" />}
                            label="Entité"
                          >
                            <span>{log.entity}</span>
                            {log.entityId != null && (
                              <span className="text-muted-foreground ml-1">#{log.entityId}</span>
                            )}
                          </DetailRow>

                          <DetailRow
                            icon={<User className="h-4 w-4" />}
                            label="Utilisateur"
                          >
                            {log.user ? (
                              <div>
                                <span>{log.user.nom}</span>
                                <span className="text-muted-foreground ml-1 text-xs">
                                  ({log.user.email})
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">Système / Inconnu</span>
                            )}
                          </DetailRow>

                          <DetailRow
                            icon={<Calendar className="h-4 w-4" />}
                            label="Date & heure"
                          >
                            <span>{formatDateTime(log.createdAt)}</span>
                          </DetailRow>
                        </div>

                        {/* Détails textuels complets */}
                        {log.details && (
                          <div className="pt-2 border-t border-border/40">
                            <DetailRow
                              icon={<FileText className="h-4 w-4" />}
                              label="Détails"
                            >
                              {detailsJson ? (
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">
                                    Données structurées associées :
                                  </p>
                                  <pre className="rounded-lg bg-muted/60 p-3 text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto text-foreground/80 border border-border/30">
                                    {JSON.stringify(detailsJson.data, null, 2)}
                                  </pre>
                                </div>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap">{log.details}</p>
                              )}
                            </DetailRow>
                          </div>
                        )}

                        {/* Lien vers l'entité (si applicable) */}
                        {log.entityId != null && (() => {
                          const base = ENTITY_ROUTES[log.entity];
                          if (!base) return null;
                          return (
                            <div className="pt-2 border-t border-border/40">
                              <a
                                href={`${base}/${log.entityId}`}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Voir {log.entity.toLowerCase()} #{log.entityId}
                              </a>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {actionFilter
                  ? `Aucune action de type "${ACTION_LABELS[actionFilter] || actionFilter}" trouvée`
                  : 'Aucune activité enregistrée pour le moment'}
              </p>
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                onPageChange={(p) => {
                  setPage(p);
                  setExpandedId(null);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
