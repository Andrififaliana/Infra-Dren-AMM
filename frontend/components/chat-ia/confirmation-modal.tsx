'use client';

import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProposedAction } from '@/types/chat-ia';

interface ConfirmationModalProps {
  action: ProposedAction;
  confirmInput: string;
  onConfirmInputChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting: boolean;
}

const actionLabels: Record<string, { label: string; color: string; border: string }> = {
  create: { label: 'CRÉATION', color: 'bg-blue-600', border: 'border-blue-300' },
  update: { label: 'MODIFICATION', color: 'bg-amber-600', border: 'border-amber-300' },
  delete: { label: 'SUPPRESSION', color: 'bg-red-600', border: 'border-red-300' },
};

export function ConfirmationModal({
  action,
  confirmInput,
  onConfirmInputChange,
  onConfirm,
  onCancel,
  isExecuting,
}: ConfirmationModalProps) {
  const actionInfo = actionLabels[action.actionType] || actionLabels.update;
  const isConfirmed = confirmInput === 'CONFIRMER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`${actionInfo.color} px-6 py-5 text-white`}>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8" />
            <div>
              <h2 className="text-lg font-bold">Confirmation requise</h2>
              <p className="text-sm opacity-90">
                Action de {actionInfo.label.toLowerCase()} — {action.entity}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Détails de l'action */}
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 mb-1">
                  ⚠️ AVERTISSEMENT SÉVÈRE
                </p>
                <p className="text-sm text-red-700">{action.warning}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-medium text-amber-800 mb-1">Résumé de l'action :</p>
            <p className="text-sm text-amber-700">{action.summary}</p>
          </div>

          {/* Champ de confirmation */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Tapez <span className="font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-xs">CONFIRMER</span> pour valider cette action :
            </label>
            <Input
              id="confirm-input"
              placeholder="Tapez CONFIRMER ici..."
              value={confirmInput}
              onChange={(e) => onConfirmInputChange(e.target.value)}
              className="font-mono text-sm border-2 focus:border-red-400"
              autoComplete="off"
            />
            {confirmInput && !isConfirmed && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Tapez exactement "CONFIRMER" (en majuscules)
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
          <Button variant="outline" onClick={onCancel} disabled={isExecuting}>
            Annuler
          </Button>
          <Button
            variant={action.actionType === 'delete' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={!isConfirmed || isExecuting}
            loading={isExecuting}
          >
            {isExecuting ? 'Exécution...' : `Confirmer la ${actionInfo.label.toLowerCase()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
