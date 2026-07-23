export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  proposedAction?: ProposedAction | null;
}

export interface ProposedAction {
  actionType: 'create' | 'update' | 'delete';
  entity: string;
  entityId?: number;
  data: Record<string, any>;
  summary: string;
  warning: string;
}

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  proposedAction?: ProposedAction | null;
}

export interface ExecuteActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface EntityInfo {
  name: string;
  description: string;
  requiredFields: string[];
}

export interface SchemaInfo {
  entities: EntityInfo[];
  stats: {
    totalEtablissements: number;
    totalBatiments: number;
    totalSalles: number;
    totalEquipements: number;
    totalTrajets: number;
    totalAleas: number;
  };
}
