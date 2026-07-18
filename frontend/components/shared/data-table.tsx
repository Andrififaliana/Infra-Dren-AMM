'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading,
  emptyMessage = 'Aucune donnée',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="p-8 text-center text-sm text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="p-8 text-center text-sm text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'transition-colors',
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                )}
              >
                {columns.map((col) => {
                  const value = col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '');
                  return (
                    <td
                      key={col.key}
                      className={cn('whitespace-nowrap px-4 py-3 text-sm text-gray-700', col.className)}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper to render boolean values
export function BooleanBadge({ value, trueLabel = 'Oui', falseLabel = 'Non' }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <Badge variant={value ? 'success' : 'danger'}>
      {value ? trueLabel : falseLabel}
    </Badge>
  );
}
