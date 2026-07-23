'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle, ShieldAlert, Loader2, Check, X, List, Key } from 'lucide-react';
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
        <div className="rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground">
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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted/30 text-foreground shadow-sm',
        )}
      >
        {/* Content */}
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted-foreground to-foreground shadow-sm">
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
    create: { bg: 'bg-chart-4/10', badge: 'bg-chart-4', label: 'CRÉATION' },
    update: { bg: 'bg-chart-2/10', badge: 'bg-chart-2', label: 'MODIFICATION' },
    delete: { bg: 'bg-destructive/10', badge: 'bg-destructive', label: 'SUPPRESSION' },
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

  useEffect(() => {
    return () => {
      if (disarmTimerRef.current) clearTimeout(disarmTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isArmed) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        disarm();
      }
    };
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

  const dataEntries = Object.entries(action.data);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('rounded-xl p-4 mt-2 relative overflow-hidden shadow-sm', colors.bg.replace('/10', '/20'))}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {colors.label} — {action.entity}
          </span>
        </div>
        <button
          onClick={handleCancel}
          disabled={isExecuting}
          className="rounded-lg p-1 text-muted-foreground hover:bg-background/50 transition-colors"
          title="Annuler"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground mb-2">{action.summary}</p>

      {/* Data fields */}
      {dataEntries.length > 0 && (
        <div className="mb-3 rounded-lg bg-background/50 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
            <List className="h-3 w-3" />
            Données de l&apos;action
          </div>
          {dataEntries.map(([key, value]) => (
            <div key={key} className="flex items-start gap-2 text-xs">
              <span className="font-mono text-muted-foreground shrink-0">{key}:</span>
              <span className="text-foreground break-all">{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warning */}
      <p className="text-xs text-destructive mb-2 flex items-start gap-1.5">
        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
        {action.warning}
      </p>
      <p className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1">
        <ShieldAlert className="h-3 w-3" />
        Double confirmation requise pour exécuter l'action
      </p>

      {/* Actions */}
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
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Confirmer
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="armed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                size="sm"
                variant="destructive"
                onClick={handleSecondClick}
                disabled={isExecuting}
                loading={isExecuting}
                className="animate-pulse"
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
            </motion.div>
          )}
        </AnimatePresence>

        {!isArmed && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isExecuting}
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Annuler
          </Button>
        )}
      </div>
    </motion.div>
  );
}
