'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Trash2, Bot, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatIa } from '@/hooks/use-chat-ia';
import { ChatMessage, ActionPreviewCard } from './chat-message';

const suggestedQuestions = [
  'Combien d\'établissements sont enregistrés ?',
  'Quels sont les bâtiments les plus anciens ?',
  'Ajoute un nouvel établissement scolaire',
  'Donne moi les statistiques globales',
];

export function ChatIaWidget() {
  const {
    messages,
    isLoading,
    isExecuting,
    sendMessage,
    executeAction,
    cancelAction,
    clearConversation,
    fetchSchemaInfo,
  } = useChatIa();

  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les infos du schéma au montage
  useEffect(() => {
    fetchSchemaInfo();
  }, [fetchSchemaInfo]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input après chaque réponse
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    setShowSuggestions(false);
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedClick = (question: string) => {
    setInput(question);
    setShowSuggestions(false);
    sendMessage(question);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Assistant IA InfraDren</h2>
            <p className="text-xs text-slate-500">Analyse et gestion des données</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => {
                clearConversation();
                setShowSuggestions(true);
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
              title="Nouvelle conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-inner">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Assistant IA InfraDren
            </h3>
            <p className="max-w-md text-sm text-slate-500 mb-8">
              Posez des questions sur les infrastructures scolaires, 
              demandez des analyses ou des modifications de données.
              <br />
              <span className="text-xs text-amber-600 mt-1 block">
                ⚠️ Toute modification nécessite une confirmation sévère.
              </span>
            </p>

            {/* Suggested questions */}
            {showSuggestions && (
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedClick(q)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx === messages.length - 1 ? 0 : 0, duration: 0.2 }}
                >
                  <ChatMessage message={msg} />
                  {msg.proposedAction && (
                    <div className="flex justify-start pl-11 pb-2">
                      <ActionPreviewCard
                        action={msg.proposedAction}
                        onExecute={executeAction}
                        onCancel={cancelAction}
                        isExecuting={isExecuting}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 py-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  <span className="text-sm text-slate-500">Réflexion en cours...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-green-400 focus:bg-white disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-10 w-10 rounded-xl p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
