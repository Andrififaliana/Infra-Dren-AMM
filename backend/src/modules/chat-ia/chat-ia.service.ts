import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { ChatMessageDto, ChatHistoryEntry, ChatResponseDto } from './dto/chat-message.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ChatIaService {
  private readonly logger = new Logger(ChatIaService.name);
  private openai: OpenAI;
  private readonly systemPrompt: string;

  // Stockage en mémoire des conversations (pas de DB)
  private conversations: Map<number, Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY non configurée — le chat IA ne fonctionnera pas');
    } else {
      this.openai = new OpenAI({ apiKey });
    }

    this.systemPrompt = `Tu es un assistant IA spécialisé dans la gestion des infrastructures scolaires de la région Amoron'i Mania (AMM) à Madagascar.

# CONTEXTE DU SYSTÈME
Tu aides les administrateurs et responsables à comprendre, analyser et gérer les données des établissements scolaires via l'application InfraDren AMM.

# MODÈLES DE DONNÉES DISPONIBLES
Voici les entités principales que tu peux consulter via la base de données :

1. **Etablissement** - Établissement scolaire
   - id, nomEtab, dren, cisco, zap, commune, fokontany, quartier
   - latitude, longitude, couvTelephonique (bool), couvInternet (bool)
   - nbEnseignantG, nbEnseignantF, nbSectionG, nbSectionF
   - Relations: directeur, designations, structures, batiments, photos

2. **Batiment** - Bâtiment d'un établissement
   - idBat, sigleBat, nbNiveau, anneeRecProvC, anneeDefC, srcFic, agenceC, anneeR, srcFir, agenceR, dispositifAc
   - Relations: etablissement, salles, toilettes

3. **Salle** - Salle de classe
   - idSalle, sigleSalle, niveauSalle, affectationSalle, etatSalle, estOperationnel (bool), estElectrifiee (bool)
   - longueurInt, hauteurSP, nbEleveF, nbEleveG
   - Relations: batiment, equipements, ouvertures

4. **Equipement** - Équipement d'une salle
   - id, nomEquip, typeEquip, etat, quantite
   - Relations: salle

5. **Trajet** - Trajet scolaire
   - idTrajet, debutTrajet, finTrajet, nomTrajet
   - Relations: moyens, periode, effets

6. **Alea** - Aléa / incident
   - idAleat, typeAleat, nomAleat, dateAleat, explication
   - Relations: effets

7. **User** - Utilisateur de l'application
   - id, email, nom, role (ADMIN | RESPONSABLE_INFRASTRUCTURE), actif

# RÈGLES IMPORTANTES
1. Tu peux analyser les données et répondre aux questions sur la structure, les statistiques, etc.
2. Si l'utilisateur te demande d'**AJOUTER**, **MODIFIER** ou **SUPPRIMER** des données, tu dois:
   a. Analyser la demande
   b. Proposer une **action structurée** que l'utilisateur devra confirmer
   c. Pour chaque action, tu dois retourner un JSON avec les clés:
      - "actionType": "create" | "update" | "delete"
      - "entity": le nom de l'entité
      - "entityId": l'ID si applicable
      - "data": les données à créer/modifier
      - "summary": un résumé en français de ce qui sera fait
      - "warning": un avertissement sévère expliquant les conséquences
   d. Tu ne DOIS JAMAIS exécuter l'action directement — seulement la proposer
   e. Tu DOIS TOUJOURS demander une confirmation sévère avant toute action destructive
3. Réponds toujours en FRANÇAIS.
4. Sois précis, concis et professionnel.`;
  }

  /**
   * Envoie un message à l'IA et retourne la réponse
   */
  async sendMessage(
    dto: ChatMessageDto,
    user: CurrentUserPayload,
  ): Promise<ChatResponseDto> {
    if (!this.openai) {
      throw new BadRequestException(
        'Clé API OpenAI non configurée. Contactez l\'administrateur.',
      );
    }

    // Récupérer ou créer la conversation en mémoire
    const userId = user.id;
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, [
        { role: 'system', content: await this.buildSystemPrompt(user) },
      ]);
    }

    const conversation = this.conversations.get(userId)!;

    // Ajouter le message utilisateur
    conversation.push({ role: 'user', content: dto.message });

    // Si un historique est fourni, le fusionner (en évitant les doublons)
    if (dto.history && dto.history.length > 0) {
      // Garder le system prompt et ajouter l'historique
      const systemPrompt = conversation[0];
      const historyMessages = dto.history.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      }));
      conversation.length = 0;
      conversation.push(systemPrompt, ...historyMessages, { role: 'user', content: dto.message });
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: conversation.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        temperature: 0.3,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande.';

      // Ajouter la réponse à la conversation en mémoire
      conversation.push({ role: 'assistant', content: responseText });

      // Limiter la taille de la conversation en mémoire (50 derniers messages max)
      if (conversation.length > 51) {
        const systemMsg = conversation[0];
        this.conversations.set(userId, [
          systemMsg,
          ...conversation.slice(-50),
        ]);
      }

      // Analyser si la réponse contient une action proposée
      const proposedAction = this.extractProposedAction(responseText);

      return {
        message: proposedAction ? this.cleanResponseText(responseText) : responseText,
        proposedAction,
      };
    } catch (error) {
      this.logger.error('Erreur OpenAI:', error);
      throw new BadRequestException(
        'Erreur lors de la communication avec l\'IA. Veuillez réessayer.',
      );
    }
  }

  /**
   * Exécute une action après confirmation sévère
   */
  async executeAction(
    actionType: string,
    entity: string,
    data: Record<string, any>,
    entityId: number | undefined,
    user: CurrentUserPayload,
  ): Promise<any> {
    this.logger.log(
      `Exécution d'action: ${actionType} sur ${entity} par l'utilisateur ${user.id}`,
    );

    // Vérifier que l'utilisateur a le droit de modifier des données
    if (user.role !== 'ADMIN' && user.role !== 'RESPONSABLE_INFRASTRUCTURE') {
      throw new ForbiddenException(
        'Vous n\'avez pas les droits pour effectuer cette action.',
      );
    }

    try {
      let result: any;

      switch (actionType) {
        case 'create':
          result = await this.executeCreate(entity, data);
          await this.auditService.creation(entity, result?.id ?? 0, JSON.stringify(data));
          break;

        case 'update':
          if (!entityId) {
            throw new BadRequestException('ID requis pour la modification');
          }
          result = await this.executeUpdate(entity, entityId, data);
          await this.auditService.modification(entity, entityId, JSON.stringify(data));
          break;

        case 'delete':
          if (!entityId) {
            throw new BadRequestException('ID requis pour la suppression');
          }
          await this.executeDelete(entity, entityId);
          await this.auditService.suppression(entity, entityId);
          break;

        default:
          throw new BadRequestException(`Type d'action inconnu: ${actionType}`);
      }

      return {
        success: true,
        message: `Action ${actionType} sur ${entity} effectuée avec succès.`,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'exécution de l'action:`, error);
      throw error;
    }
  }

  /**
   * Nettoie la mémoire des conversations pour un utilisateur
   */
  clearConversation(userId: number): void {
    this.conversations.delete(userId);
  }

  /**
   * Récupère la liste des entités disponibles avec leur structure
   */
  async getSchemaInfo(user: CurrentUserPayload): Promise<any> {
    return {
      entities: [
        { name: 'Etablissement', description: 'Établissement scolaire' },
        { name: 'Batiment', description: 'Bâtiment d\'un établissement' },
        { name: 'Salle', description: 'Salle de classe' },
        { name: 'Equipement', description: 'Équipement d\'une salle' },
        { name: 'Trajet', description: 'Trajet scolaire' },
        { name: 'Alea', description: 'Aléa / incident' },
        { name: 'User', description: 'Utilisateur' },
      ],
      stats: await this.getQuickStats(),
    };
  }

  // ─── Méthodes privées ─────────────────────────────────

  private async buildSystemPrompt(user: CurrentUserPayload): Promise<string> {
    const stats = await this.getQuickStats();
    return `${this.systemPrompt}

# STATISTIQUES ACTUELLES
- Total établissements: ${stats.totalEtablissements}
- Total bâtiments: ${stats.totalBatiments}
- Total salles: ${stats.totalSalles}
- Total équipements: ${stats.totalEquipements}
- Total trajets: ${stats.totalTrajets}
- Total aléas: ${stats.totalAleas}

Utilisateur connecté: ${user.nom} (${user.role})`;
  }

  private async getQuickStats() {
    const [
      totalEtablissements,
      totalBatiments,
      totalSalles,
      totalEquipements,
      totalTrajets,
      totalAleas,
    ] = await Promise.all([
      this.prisma.etablissement.count(),
      this.prisma.batiment.count(),
      this.prisma.salle.count(),
      this.prisma.equipement.count(),
      this.prisma.trajet.count(),
      this.prisma.alea.count(),
    ]);

    return {
      totalEtablissements,
      totalBatiments,
      totalSalles,
      totalEquipements,
      totalTrajets,
      totalAleas,
    };
  }

  /**
   * Extrait une action proposée du texte de réponse
   */
  private extractProposedAction(text: string): {
    actionType: 'create' | 'update' | 'delete';
    entity: string;
    entityId?: number;
    data: Record<string, any>;
    summary: string;
    warning: string;
  } | null {
    try {
      // Chercher un bloc JSON dans la réponse
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.actionType && parsed.entity) {
          return {
            actionType: parsed.actionType,
            entity: parsed.entity,
            entityId: parsed.entityId,
            data: parsed.data || {},
            summary: parsed.summary || '',
            warning: parsed.warning || '',
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Nettoie le texte de réponse des blocs JSON d'action
   */
  private cleanResponseText(text: string): string {
    return text.replace(/```json\n[\s\S]*?\n```/g, '').trim();
  }

  /**
   * Exécute une création sur l'entité spécifiée
   */
  private async executeCreate(entity: string, data: Record<string, any>): Promise<any> {
    switch (entity.toLowerCase()) {
      case 'etablissement':
        return this.prisma.etablissement.create({ data: data as any });

      case 'batiment':
        return this.prisma.batiment.create({ data: data as any });

      case 'salle':
        return this.prisma.salle.create({ data: data as any });

      case 'equipement':
        return this.prisma.equipement.create({ data: data as any });

      case 'trajet':
        return this.prisma.trajet.create({ data: data as any });

      case 'alea':
        return this.prisma.alea.create({ data: data as any });

      case 'user':
        return this.prisma.user.create({ data: data as any });

      default:
        throw new BadRequestException(`Entité inconnue: ${entity}`);
    }
  }

  /**
   * Exécute une modification sur l'entité spécifiée
   */
  private async executeUpdate(entity: string, id: number, data: Record<string, any>): Promise<any> {
    switch (entity.toLowerCase()) {
      case 'etablissement':
        return this.prisma.etablissement.update({ where: { id }, data: data as any });

      case 'batiment':
        return this.prisma.batiment.update({ where: { idBat: id }, data: data as any });

      case 'salle':
        return this.prisma.salle.update({ where: { idSalle: id }, data: data as any });

      case 'equipement':
        return this.prisma.equipement.update({ where: { id }, data: data as any });

      case 'trajet':
        return this.prisma.trajet.update({ where: { idTrajet: id }, data: data as any });

      case 'alea':
        return this.prisma.alea.update({ where: { idAleat: id }, data: data as any });

      case 'user':
        return this.prisma.user.update({ where: { id }, data: data as any });

      default:
        throw new BadRequestException(`Entité inconnue: ${entity}`);
    }
  }

  /**
   * Exécute une suppression sur l'entité spécifiée
   */
  private async executeDelete(entity: string, id: number): Promise<any> {
    switch (entity.toLowerCase()) {
      case 'etablissement':
        return this.prisma.etablissement.delete({ where: { id } });

      case 'batiment':
        return this.prisma.batiment.delete({ where: { idBat: id } });

      case 'salle':
        return this.prisma.salle.delete({ where: { idSalle: id } });

      case 'equipement':
        return this.prisma.equipement.delete({ where: { id } });

      case 'trajet':
        return this.prisma.trajet.delete({ where: { idTrajet: id } });

      case 'alea':
        return this.prisma.alea.delete({ where: { idAleat: id } });

      case 'user':
        return this.prisma.user.delete({ where: { id } });

      default:
        throw new BadRequestException(`Entité inconnue: ${entity}`);
    }
  }
}
