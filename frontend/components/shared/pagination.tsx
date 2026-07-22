'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-4">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Page {page} sur {totalPages}
        <span className="hidden sm:inline"> ({total} résultats)</span>
      </p>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Précédent</span>
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {generatePageNumbers(page, totalPages).map((p, i) =>
            p === -1 ? (
              <span key={`dots-${i}`} className="px-1 text-muted-foreground">...</span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="icon-sm"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            )
          )}
        </div>

        <span className="sm:hidden text-sm font-medium px-1">
          {page}/{totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="gap-1"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function generatePageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: number[] = [];
  pages.push(1);

  if (current > 3) pages.push(-1);

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push(-1);

  pages.push(total);
  return pages;
}
