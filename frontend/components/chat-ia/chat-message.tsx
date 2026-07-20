'use client';

import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle } from 'lucide-react';
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

export function ActionPreviewCard({
  action,
}: {
  action: NonNullable<ChatMessageType['proposedAction']>;
}) {
  const actionColors = {
    create: { bg: 'bg-blue-50 border-blue-200', icon: '🆕', label: 'CRÉATION' },
    update: { bg: 'bg-amber-50 border-amber-200', icon: '✏️', label: 'MODIFICATION' },
    delete: { bg: 'bg-red-50 border-red-200', icon: '🗑️', label: 'SUPPRESSION' },
  };

  const colors = actionColors[action.actionType];

  return (
    <div className={cn('rounded-xl border-2 p-4 mt-2', colors.bg)}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {colors.icon} {colors.label} — {action.entity}
        </span>
      </div>
      <p className="text-sm text-slate-700 mb-1">{action.summary}</p>
      <p className="text-xs text-red-600 font-medium">{action.warning}</p>
    </div>
  );
}
