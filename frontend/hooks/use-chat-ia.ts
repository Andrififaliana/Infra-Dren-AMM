import { useState, useCallback, useRef } from 'react';
import apiClient from '@/lib/api-client';
import type {
  ChatMessage,
  ChatResponse,
  ProposedAction,
  ExecuteActionResponse,
  ChatHistoryEntry,
  SchemaInfo,
} from '@/types/chat-ia';
import type { ApiResponse } from '@/types/api';

export function useChatIa() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ProposedAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [schemaInfo, setSchemaInfo] = useState<SchemaInfo | null>(null);
  const idCounter = useRef(0);

  const addMessage = useCallback(
    (role: 'user' | 'assistant' | 'system', content: string, proposedAction?: ProposedAction | null) => {
      const msg: ChatMessage = {
        id: `msg-${++idCounter.current}`,
        role,
        content,
        timestamp: new Date(),
        proposedAction: proposedAction || null,
      };
      setMessages((prev) => [...prev, msg]);
      return msg;
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);
      setPendingAction(null);
      setConfirmInput('');
      addMessage('user', text);
      setIsLoading(true);

      // Préparer l'historique pour le backend
      const history: ChatHistoryEntry[] = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      try {
        const { data: response } = await apiClient.post<ApiResponse<ChatResponse>>(
          '/chat-ia/message',
          { message: text, history: history.slice(-20) },
        );

        const { message, proposedAction } = response.data;

        addMessage('assistant', message, proposedAction);

        if (proposedAction) {
          setPendingAction(proposedAction);
        }
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          'Erreur de communication avec le serveur.';
        setError(errorMsg);
        addMessage('system', `❌ ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, addMessage],
  );

  const executeAction = useCallback(
    async () => {
      if (!pendingAction || isExecuting) return;

      setIsExecuting(true);
      try {
        const { data: response } = await apiClient.post<ApiResponse<ExecuteActionResponse>>(
          '/chat-ia/execute',
          {
            actionType: pendingAction.actionType,
            entity: pendingAction.entity,
            data: pendingAction.data,
            entityId: pendingAction.entityId,
          },
        );

        addMessage('assistant', `✅ **Action exécutée avec succès :**\n\n${response.data.message}`);

        // Récupérer les stats mises à jour
        fetchSchemaInfo();

        setPendingAction(null);
        setConfirmInput('');
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          'Erreur lors de l\'exécution de l\'action.';
        setError(errorMsg);
        addMessage('system', `❌ ${errorMsg}`);
      } finally {
        setIsExecuting(false);
      }
    },
    [pendingAction, isExecuting, addMessage],
  );

  const cancelAction = useCallback(() => {
    setPendingAction(null);
    setConfirmInput('');
    addMessage('system', '⛔ Action annulée par l\'utilisateur.');
  }, [addMessage]);

  const clearConversation = useCallback(async () => {
    try {
      await apiClient.delete('/chat-ia/conversation');
    } catch {
      // Ignorer
    }
    setMessages([]);
    setPendingAction(null);
    setConfirmInput('');
    setError(null);
    addMessage('system', '💬 Conversation réinitialisée.');
  }, [addMessage]);

  const fetchSchemaInfo = useCallback(async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<SchemaInfo>>('/chat-ia/schema');
      setSchemaInfo(data.data);
    } catch {
      // Silently fail
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    pendingAction,
    isExecuting,
    confirmInput,
    schemaInfo,
    setConfirmInput,
    sendMessage,
    executeAction,
    cancelAction,
    clearConversation,
    fetchSchemaInfo,
  };
}
