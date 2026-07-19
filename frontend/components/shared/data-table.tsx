'use client';

import { useCallback } from 'react';
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
  /** Active les checkboxes de sélection */
  selectable?: boolean;
  /** Ensemble des IDs sélectionnés */
  selectedIds?: Set<string | number>;
  /** Callback quand la sélection change */
  onSelectionChange?: (ids: Set<string | number>) => void;
  /** Permet de customiser le fond d'une ligne selectionnée */
  getRowId?: (item: T) => string | number;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading,
  emptyMessage = 'Aucune donnée',
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && data.every((item) => selectedIds.has(keyExtractor(item)));
  const someSelected = data.some((item) => selectedIds.has(keyExtractor(item)));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange?.(new Set());
    } else {
      const all = new Set(data.map((item) => keyExtractor(item)));
      onSelectionChange?.(all);
    }
  }, [allSelected, data, keyExtractor, onSelectionChange]);

  const toggleOne = useCallback(
    (id: string | number) => {
      const next = new Set(selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onSelectionChange?.(next);
    },
    [selectedIds, onSelectionChange]
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="p-8 text-center text-sm text-slate-500">Chargement...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="p-8 text-center text-sm text-slate-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {selectable && (
                <th className="w-10 px-2 py-3">
                  <label className="flex cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500/40"
                    />
                  </label>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((item) => {
            const id = keyExtractor(item);
            const isSelected = selectedIds.has(id);
            return (
              <tr
                key={id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'transition-colors',
                  (onRowClick || selectable) ? 'cursor-pointer' : '',
                  isSelected ? 'bg-green-50/60' : 'hover:bg-slate-50'
                )}
              >
                {selectable && (
                  <td className="w-10 px-2 py-3">
                    <label className="flex cursor-pointer items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500/40"
                      />
                    </label>
                  </td>
                )}
                  {columns.map((col) => {
                    const value = col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '');
                    return (
                      <td
                        key={col.key}
                        className={cn('whitespace-nowrap px-4 py-3 text-sm text-slate-700', col.className)}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
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
