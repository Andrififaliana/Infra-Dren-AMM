'use client';

import { LayoutList, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface GridViewProps<T> {
  data: T[];
  keyExtractor: (item: T) => string | number;
  renderCard: (item: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
  /** Minimum width des cartes en pixels (responsive) */
  minCardWidth?: number;
}

export function GridView<T>({
  data,
  keyExtractor,
  renderCard,
  loading,
  emptyMessage = 'Aucune donnée',
  skeletonCount = 6,
  minCardWidth = 280,
}: GridViewProps<T>) {
  if (loading) {
    return (
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
        }}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-card p-4 space-y-3 shadow-sm"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
      }}
    >
      {data.map((item) => (
        <div key={keyExtractor(item)}>{renderCard(item)}</div>
      ))}
    </div>
  );
}

// ─── View Toggle ────────────────────────────────────────

interface ViewToggleProps {
  viewMode: 'list' | 'grid';
  onChange: (mode: 'list' | 'grid') => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg bg-muted/30 p-0.5 shadow-sm">
      <button
        onClick={() => onChange('list')}
        className={cn(
          'rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
          viewMode === 'list'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        title="Vue liste"
      >
        <LayoutList className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('grid')}
        className={cn(
          'rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
          viewMode === 'grid'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        title="Vue grille"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
