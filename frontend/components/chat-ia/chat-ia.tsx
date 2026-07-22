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
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Assistant IA</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              clearConversation();
              setShowSuggestions(true);
            }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
            title="Nouvelle conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-12">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="max-w-md text-sm text-muted-foreground mb-6">
              Posez des questions sur les infrastructures scolaires, 
              demandez des analyses ou des modifications.
            </p>

            {/* Suggested questions */}
            {showSuggestions && (
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedClick(q)}
                    className="rounded-lg border px-3 py-2.5 text-left text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Réflexion en cours...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t bg-background px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-10 w-10 rounded-lg p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
