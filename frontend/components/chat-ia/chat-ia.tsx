'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Trash2, Bot, Sparkles, Loader2, BookOpen, Database, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatIa } from '@/hooks/use-chat-ia';
import { ChatMessage, ActionPreviewCard } from './chat-message';

const suggestedQuestions = [
  'Comment utiliser cette application ?',
  'Combien d\'établissements sont enregistrés ?',
  'Ajoute un établissement à Ambositra',
  'Quels sont les bâtiments les plus anciens ?',
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
    schemaInfo,
  } = useChatIa();

  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showTips, setShowTips] = useState(false);
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowTips(!showTips)}
            className={cn('rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors', showTips && 'bg-muted')}
            title="Aide"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
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
      </div>

      {/* Tips panel */}
      {showTips && (
        <div className="border-b bg-muted/30 px-5 py-3 text-xs text-muted-foreground space-y-1.5">
          <p className="font-medium text-foreground flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" />
            Comment utiliser l&apos;assistant
          </p>
          <p>• Posez des questions sur les données : <span className="text-foreground">&quot;Combien d&apos;établissements ?&quot;</span></p>
          <p>• Demandez des modifications : <span className="text-foreground">&quot;Ajoute un établissement à Ambositra&quot;</span></p>
          <p>• L&apos;assistant vous demandera les champs obligatoires avant chaque action</p>
          <p>• Les actions destructives nécessitent une double confirmation</p>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center overflow-y-auto py-8 px-4">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="max-w-md text-sm text-muted-foreground mb-6">
              Posez des questions sur les infrastructures scolaires, 
              demandez des analyses ou des modifications.
            </p>

            {/* Suggested questions */}
            {showSuggestions && (
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2 mb-6">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedClick(q)}
                    className="rounded-lg border px-3 py-2.5 text-left text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Entités disponibles */}
            {schemaInfo && schemaInfo.entities.length > 0 && (
              <div className="w-full max-w-lg text-left">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Database className="h-3 w-3" />
                  Entités disponibles
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {schemaInfo.entities.map((e) => (
                    <div key={e.name} className="rounded-lg border bg-background px-2.5 py-2 text-xs">
                      <span className="font-medium text-foreground">{e.name}</span>
                      <p className="text-muted-foreground truncate">{e.description}</p>
                      {e.requiredFields && e.requiredFields.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          Requis : {e.requiredFields.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
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
