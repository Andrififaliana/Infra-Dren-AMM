'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useIaLogs, useIaLogStats } from '@/hooks/use-ia-logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatDateShort, formatNumber } from '@/lib/utils';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function IALogsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const successParam = filter === 'all' ? undefined : filter === 'success' ? 'true' : 'false';

  const { data: logsData, isLoading } = useIaLogs(page, 50, successParam);
  const { data: stats } = useIaLogStats();

  const logs = logsData?.data ?? [];
  const meta = logsData?.meta;

  // Données pour le graphique (dernières 24h simulées)
  const chartData = [
    { hour: '00h', requetes: 12, succes: 11 },
    { hour: '02h', requetes: 8, succes: 8 },
    { hour: '04h', requetes: 5, succes: 5 },
    { hour: '06h', requetes: 15, succes: 14 },
    { hour: '08h', requetes: 28, succes: 26 },
    { hour: '10h', requetes: 35, succes: 33 },
    { hour: '12h', requetes: 22, succes: 21 },
    { hour: '14h', requetes: 30, succes: 29 },
    { hour: '16h', requetes: 18, succes: 17 },
    { hour: '18h', requetes: 14, succes: 13 },
    { hour: '20h', requetes: 10, succes: 10 },
    { hour: '22h', requetes: 7, succes: 7 },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Monitoring IA' }]} />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Brain className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Monitoring IA</h1>
        </div>
        <p className="text-sm text-gray-500">
          Surveillance des requêtes envoyées à l&apos;API IA (temps de réponse, tokens, erreurs)
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Requêtes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats ? formatNumber(stats.totalRequests) : '...'}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Succès / Échecs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats ? (
                      <>
                        <span className="text-green-600">{formatNumber(stats.totalSuccess)}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-500">{formatNumber(stats.totalErrors)}</span>
                      </>
                    ) : '...'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tokens Consommés</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats ? formatNumber(stats.totalTokens.total) : '...'}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Temps Moyen</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats ? `${stats.avgResponseTimeMs} ms` : '...'}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphiques */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-green-500" />
              Requêtes (dernières 24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="succes" name="Succès" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="requetes" name="Total" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-500" />
              Temps de réponse (ms, dernières 24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.map(d => ({ ...d, temps: Math.floor(Math.random() * 2000) + 500 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit=" ms" />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="temps" name="Temps (ms)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtre et tableau */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-green-500" />
              Historique des requêtes
            </CardTitle>
            <Select
              id="filter"
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              options={[
                { value: 'all', label: 'Toutes les requêtes' },
                { value: 'success', label: 'Succès uniquement' },
                { value: 'error', label: 'Échecs uniquement' },
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {/* En-tête du tableau (desktop) */}
              <div className="hidden md:grid md:grid-cols-7 gap-4 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <span>Date</span>
                <span className="col-span-2">Utilisateur</span>
                <span>Tokens</span>
                <span>Temps</span>
                <span>Longueur</span>
                <span>Statut</span>
              </div>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Mobile: affichage compact */}
                  <div className="md:hidden flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{formatDateShort(log.createdAt)}</span>
                    <Badge variant={log.success ? 'success' : 'destructive'}>
                      {log.success ? 'Succès' : 'Échec'}
                    </Badge>
                  </div>
                  <div className="md:hidden text-xs text-gray-700">
                    <strong>Utilisateur :</strong> {log.user?.nom || log.userEmail || 'N/A'}
                    {log.errorMessage && (
                      <p className="text-red-500 mt-1">❌ {log.errorMessage}</p>
                    )}
                  </div>
                  <div className="md:hidden grid grid-cols-3 gap-2 text-xs text-gray-500 mt-1">
                    <span>Tokens: {log.totalTokens ?? '-'}</span>
                    <span>{log.responseTimeMs} ms</span>
                    <span>Prompt: {log.promptLength}c</span>
                  </div>

                  {/* Desktop */}
                  <span className="hidden md:block text-xs text-gray-500">{formatDateShort(log.createdAt)}</span>
                  <span className="hidden md:block col-span-2 text-xs text-gray-700">
                    {log.user?.nom || log.userEmail || 'N/A'}
                    {log.errorMessage && (
                      <span className="block text-red-500 text-[10px] mt-0.5 truncate" title={log.errorMessage}>
                        ❌ {log.errorMessage}
                      </span>
                    )}
                  </span>
                  <span className="hidden md:block text-xs text-gray-600">
                    <span className="font-mono">{log.totalTokens ?? '-'}</span>
                    <span className="text-gray-400"> (P:{log.promptTokens ?? '-'}/C:{log.completionTokens ?? '-'})</span>
                  </span>
                  <span className="hidden md:block text-xs text-gray-600 font-mono">{log.responseTimeMs} ms</span>
                  <span className="hidden md:block text-xs text-gray-600">
                    {log.promptLength}c → {log.responseLength}c
                  </span>
                  <span className="hidden md:block">
                    <Badge variant={log.success ? 'success' : 'destructive'}>
                      {log.success ? 'OK' : 'ERR'}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Brain className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                {filter !== 'all'
                  ? `Aucun log ${filter === 'success' ? 'réussi' : 'en échec'} trouvé`
                  : 'Aucune requête IA enregistrée pour le moment'}
              </p>
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="mt-4">
              <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
