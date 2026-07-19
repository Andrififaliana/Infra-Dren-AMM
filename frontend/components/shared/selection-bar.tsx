'use client';

import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  entityName?: string;
}

export function SelectionBar({
  selectedCount,
  onClear,
  onDelete,
  isDeleting = false,
  entityName = 'élément(s)',
}: SelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-lg backdrop-blur-sm">
        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
          <strong className="text-green-700">{selectedCount}</strong> {entityName} sélectionné{selectedCount > 1 ? 's' : ''}
        </span>
        <div className="h-5 w-px bg-slate-200" />
        <button
          onClick={onClear}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title="Effacer la sélection"
        >
          <X className="h-4 w-4" />
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          loading={isDeleting}
          className="gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  );
}
