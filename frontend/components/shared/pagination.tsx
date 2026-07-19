'use client';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-600">
        Page {page} sur {totalPages} ({total} résultats)
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Précédent
        </Button>

        {generatePageNumbers(page, totalPages).map((p, i) =>
          p === -1 ? (
            <span key={`dots-${i}`} className="px-1 text-slate-400">...</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Suivant
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
  
  if (current > 3) {
    pages.push(-1); // dots
  }
  
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  
  if (current < total - 2) {
    pages.push(-1); // dots
  }
  
  pages.push(total);
  
  return pages;
}
