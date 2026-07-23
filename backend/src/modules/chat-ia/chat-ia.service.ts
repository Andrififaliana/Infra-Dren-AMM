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
import { IaMonitoringService } from './ia-monitoring.service';
import { ChatMessageDto, ChatHistoryEntry, ChatResponseDto } from './dto/chat-message.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ChatIaService {
  private readonly logger = new Logger(ChatIaService.name);
  private openai: OpenAI;
  private iaModel: string;
  private readonly systemPrompt: string;

  // Stockage en mémoire des conversations (pas de DB)
  private conversations: Map<number, Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly iaMonitoring: IaMonitoringService,
  ) {
    const apiKey = this.configService.get<string>('ia.apiKey');
    const baseUrl = this.configService.get<string>('ia.baseUrl');
    const model = this.configService.get<string>('ia.model');
    this.iaModel = model ?? 'llama-3.3-70b-versatile';
    if (!apiKey) {
      this.logger.warn('OPEN_API_KEY non configurée — le chat IA ne fonctionnera pas');
    } else {
      this.openai = new OpenAI({
        apiKey,
        baseURL: baseUrl,
      });
      this.logger.log(`Chat IA configuré avec l\'API à ${baseUrl}, modèle: ${this.iaModel}`);
    }

    this.systemPrompt = `Tu es un assistant IA spécialisé dans la gestion des infrastructures scolaires de la région Amoron'i Mania (AMM) à Madagascar. Tu aides les administrateurs et responsables à comprendre, analyser et gérer les données via l'application InfraDren AMM.

# GUIDE DE L'APPLICATION
Explique à l'utilisateur comment utiliser l'application si il te pose des questions sur le fonctionnement.

## Pages disponibles et description
- **Tableau de bord** : Vue d'ensemble des KPIs (établissements, bâtiments, salles, équipements), graphiques (établissements par CISCO, état des salles, couverture réseau)
- **Établissements** : Liste, recherche, ajout, modification, export PDF. Chaque établissement a des bâtiments, photos et données de couverture
- **Bâtiments** : Gestion des bâtiments par établissement avec détails de construction
- **Salles** : Gestion des salles de classe (état, équipements, effectifs élèves)
- **Équipements** : Inventaire du matériel par salle
- **Trajets** : Gestion des trajets d'accès aux établissements
- **Aléas** : Gestion des incidents et catastrophes
- **Carte** : Visualisation géographique interactive des établissements
- **Assistant IA** : Interface de chat pour poser des questions et gérer les données (page actuelle)
- **Profil** : Gestion du compte utilisateur

## Comment lire et naviguer
- Les statistiques globales sont visibles sur le tableau de bord
- Chaque page liste les entités avec barre de recherche et filtres
- Clique sur un élément pour voir ses détails et le modifier
- Les photos des établissements et bâtiments sont accessibles depuis leur page de détail

# CHAMPS OBLIGATOIRES PAR ENTITÉ
Avant de proposer une création ou modification, tu dois TOUJOURS demander les champs obligatoires manquants :

1. **Etablissement** — Requis : nomEtab (nom), dren (district), cisco, commune
2. **Batiment** — Requis : sigleBat (sigle ou nom), etablissementId (ID de l'établissement parent)
3. **Salle** — Requis : affectationSalle (affectation), batimentId (ID du bâtiment parent)
4. **Equipement** — Requis : nomEquip (nom), salleId (ID de la salle parente)
5. **Trajet** — Requis : nomTrajet (nom), debutTrajet (date début), finTrajet (date fin)
6. **Alea** — Requis : typeAleat (type), nomAleat (nom), dateAleat (date)
7. **User** — Requis : email, nom, role

# RÈGLES POUR LES ACTIONS (CREATE / UPDATE / DELETE)
1. **Avant une création**, tu dois :
   a. Lister les champs requis à l'utilisateur
   b. Demander chaque information manquante une par une
   c. Ne proposer l'action QUE lorsque tous les champs obligatoires sont fournis

2. **Avant une modification**, tu dois :
   a. Demander quel champ modifier et la nouvelle valeur
   b. Vérifier la cohérence des données
   c. Proposer l'action avec uniquement les champs modifiés

3. **Avant une suppression**, tu dois :
   a. Prévenir des conséquences (données liées supprimées)
   b. Demander confirmation explicite

4. Pour chaque action proposée, retourne un bloc JSON avec :
   \`\`\`json
   {
     "actionType": "create" | "update" | "delete",
     "entity": "nom de l'entité",
     "entityId": "ID si applicable",
     "data": { "champ": "valeur" },
     "summary": "Résumé en FRANÇAIS de l'action",
     "warning": "Avertissement sévère sur les conséquences"
   }
   \`\`\`

5. Tu ne DOIS JAMAIS exécuter l'action directement — seulement la proposer
6. Tu DOIS TOUJOURS attendre la confirmation avant de considérer l'action comme acceptée

# MODÈLES DE DONNÉES
Les entités disponibles et leurs champs :

1. **Etablissement** - Établissement scolaire
   - id, nomEtab, dren, cisco, zap, commune, fokontany, quartier
   - latitude, longitude, couvTelephonique (bool), couvInternet (bool)
   - nbEnseignantG, nbEnseignantF, nbSectionG, nbSectionF
   - Relations: directeur, designations, structures, batiments, photos

2. **Batiment** - Bâtiment
   - idBat, sigleBat, nbNiveau, anneeRecProvC, anneeDefC, srcFic, agenceC, anneeR, srcFir, agenceR, dispositifAc
   - Relations: etablissement, salles, toilettes

3. **Salle** - Salle de classe
   - idSalle, sigleSalle, niveauSalle, affectationSalle, etatSalle, estOperationnel (bool), estElectrifiee (bool)
   - longueurInt, hauteurSP, nbEleveF, nbEleveG
   - Relations: batiment, equipements, ouvertures

4. **Equipement** - Équipement
   - id, nomEquip, typeEquip, etat, quantite
   - Relations: salle

5. **Trajet** - Trajet scolaire
   - idTrajet, debutTrajet, finTrajet, nomTrajet
   - Relations: moyens, periode, effets

6. **Alea** - Aléa / incident
   - idAleat, typeAleat, nomAleat, dateAleat, explication
   - Relations: effets

7. **User** - Utilisateur
   - id, email, nom, role (ADMIN | RESPONSABLE_INFRASTRUCTURE), actif

# RÈGLES GÉNÉRALES
- Réponds toujours en FRANÇAIS
- Sois précis, concis et professionnel
- Guide l'utilisateur pas à pas si nécessaire
- Si l'utilisateur demande comment faire quelque chose, explique-lui la démarche et les pages concernées
- N'invente pas de données — base-toi sur les modèles fournis`;

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

    const startTime = Date.now();
    let promptTokens = 0;
    let completionTokens = 0;
    const promptLength = dto.message.length;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.iaModel,
        messages: conversation.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        temperature: 0.3,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande.';

      // Capturer les métriques
      const responseTimeMs = Date.now() - startTime;
      promptTokens = completion.usage?.prompt_tokens ?? 0;
      completionTokens = completion.usage?.completion_tokens ?? 0;
      const totalTokens = completion.usage?.total_tokens ?? 0;
      const responseLength = responseText.length;

      // Logger la requête IA
      this.iaMonitoring.log({
        userId: user.id,
        userEmail: user.email,
        model: this.iaModel,
        promptTokens,
        completionTokens,
        totalTokens,
        responseTimeMs,
        promptLength,
        responseLength,
        success: true,
      });

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
      const responseTimeMs = Date.now() - startTime;

      // Logger l'erreur IA
      this.iaMonitoring.log({
        userId: user.id,
        userEmail: user.email,
        model: this.iaModel,
        responseTimeMs,
        promptLength,
        responseLength: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
      });

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
