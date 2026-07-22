'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

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
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
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
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      onSelectionChange?.(next);
    },
    [selectedIds, onSelectionChange]
  );

  if (loading) {
    return (
      <div className="rounded-xl bg-card shadow-sm">
        <div className="p-8 text-center text-sm text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-card shadow-sm">
        <div className="p-8 text-center text-sm text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[650px] w-full">
          <thead>
            <tr className="bg-muted/30">
              {selectable && (
                <th className="w-10 px-2 py-3">                    <Checkbox
                    checked={someSelected && !allSelected ? 'indeterminate' : allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Sélectionner tout"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
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
                    isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                  )}
                >
                  {selectable && (
                    <td className="w-10 px-2 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Sélectionner"
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const value = col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '');
                    return (
                      <td key={col.key} className={cn('whitespace-nowrap px-4 py-3 text-sm text-foreground', col.className)}>
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
    <Badge variant={value ? 'success' : 'destructive'}>
      {value ? trueLabel : falseLabel}
    </Badge>
  );
}
