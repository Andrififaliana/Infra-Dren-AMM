'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle, ShieldAlert, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatMessage as ChatMessageType } from '@/types/chat-ia';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="rounded-full bg-slate-100 px-4 py-1.5 text-xs text-slate-500">
          {message.content.replace(/[❌⛔💬]/g, '').trim()}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 py-4',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-green-600 text-white shadow-sm'
            : 'bg-white text-slate-800 shadow-sm border border-slate-200',
        )}
      >
        {/* Content */}
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 shadow-sm">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}

// ─── Action Preview Card with Inline Double-Click Confirmation ───

interface ActionPreviewCardProps {
  action: NonNullable<ChatMessageType['proposedAction']>;
  onExecute: () => void;
  onCancel: () => void;
  isExecuting: boolean;
}

export function ActionPreviewCard({
  action,
  onExecute,
  onCancel,
  isExecuting,
}: ActionPreviewCardProps) {
  const [isArmed, setIsArmed] = useState(false);
  const disarmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const actionColors = {
    create: { bg: 'bg-blue-50 border-blue-200', badge: 'bg-blue-600', label: 'CRÉATION' },
    update: { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-600', label: 'MODIFICATION' },
    delete: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-600', label: 'SUPPRESSION' },
  };

  const colors = actionColors[action.actionType];

  const cardRef = useRef<HTMLDivElement>(null);

  const disarm = useCallback(() => {
    setIsArmed(false);
    if (disarmTimerRef.current) {
      clearTimeout(disarmTimerRef.current);
      disarmTimerRef.current = null;
    }
  }, []);

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (disarmTimerRef.current) clearTimeout(disarmTimerRef.current);
    };
  }, []);

  // Désarmer si clic en dehors de la carte
  useEffect(() => {
    if (!isArmed) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        disarm();
      }
    };
    // Petit délai pour éviter que le clic qui a armé ne déclenche le outside
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isArmed, disarm]);

  const handleFirstClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsArmed(true);
    // Auto-désarmer après 8 secondes
    disarmTimerRef.current = setTimeout(disarm, 8000);
  };

  const handleSecondClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    disarm();
    onExecute();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    disarm();
    onCancel();
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('rounded-xl border-2 p-4 mt-2 relative overflow-hidden', colors.bg)}
    >
      {/* Pulsing ring when armed */}
      {isArmed && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-red-500"
          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="h-5 w-5 text-red-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {colors.label} — {action.entity}
        </span>
      </div>

      {/* Details */}
      <p className="text-sm text-slate-700 mb-1">{action.summary}</p>
      <p className="text-xs text-red-600 font-medium mb-4">
        <AlertTriangle className="inline-block h-3 w-3 mr-1 -mt-0.5" />
        {action.warning}
      </p>

      {/* Inline confirmation buttons */}
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {!isArmed ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                size="sm"
                variant={action.actionType === 'delete' ? 'destructive' : 'default'}
                onClick={handleFirstClick}
                disabled={isExecuting}
                className="relative"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Confirmer l'action
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="armed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Button
                size="sm"
                variant="destructive"
                onClick={handleSecondClick}
                disabled={isExecuting}
                loading={isExecuting}
                className="animate-pulse shadow-lg shadow-red-500/25"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Exécution...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    Cliquez à nouveau pour confirmer
                  </>
                )}
              </Button>
              <button
                onClick={handleCancel}
                disabled={isExecuting}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Annuler"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
