'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';

interface SelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  entityName?: string;
}

export function SelectionBar({ selectedCount, onClear, onDelete, isDeleting, entityName = 'élément(s)' }: SelectionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lg">
            <span className="text-sm font-medium text-foreground">
              {selectedCount} {entityName} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2 pl-2 border-l">
              <Button variant="ghost" size="sm" onClick={onClear} className="gap-1">
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete} loading={isDeleting} className="gap-1">
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
