import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { SupabaseService } from './supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmSignupDto } from './dto/confirm-signup.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      this.logger.warn(`Échec de connexion pour ${email}: ${error?.message}`);

      // Vérifier si l'erreur est due à un email non confirmé
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        throw new UnauthorizedException(
          'Email non confirmé. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.',
        );
      }

      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const supabaseUser = data.user;
    if (!supabaseUser) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Utilisateur non trouvé dans le système');
    }

    if (!dbUser.actif) {
      throw new UnauthorizedException('Compte désactivé');
    }

    await this.auditService.connexion(dbUser.id);

    return {
      accessToken: data.session.access_token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        nom: dbUser.nom,
        role: dbUser.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, nom, role } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // 1. Créer l'utilisateur dans Supabase sans confirmer l'email
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { nom, role: role ?? 'RESPONSABLE_INFRASTRUCTURE' },
      });

    if (error || !data.user) {
      this.logger.error(
        `Erreur création utilisateur Supabase: ${error?.message}`,
      );
      throw new UnauthorizedException(
        `Erreur lors de la création: ${error?.message}`,
      );
    }

    // 2. Créer l'utilisateur dans la base de données locale
    const dbUser = await this.prisma.user.create({
      data: {
        email,
        nom,
        role: role ?? 'RESPONSABLE_INFRASTRUCTURE',
        supabaseUserId: data.user.id,
      },
    });

    // 3. Envoyer un email d'invitation/confirmation via Supabase
    const appUrl = this.configService.get<string>('cors.origin') || 'http://localhost:3000';
    try {
      const { error: inviteError } = await this.supabaseService
        .getAdminClient()
        .auth.admin.inviteUserByEmail(email, {
          redirectTo: `${appUrl}/auth/confirm`,
        });

      if (inviteError) {
        this.logger.warn(
          `Erreur envoi invitation Supabase: ${inviteError.message}`,
        );
      } else {
        this.logger.log(`Email de confirmation envoyé à ${email}`);
      }
    } catch (inviteError) {
      this.logger.warn(`Erreur inattendue envoi invitation: ${inviteError}`);
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      nom: dbUser.nom,
      role: dbUser.role,
      pendingConfirmation: true,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        actif: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }

  async verifyToken(token: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { supabaseUserId: data.user.id },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return {
      valid: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        nom: dbUser.nom,
        role: dbUser.role,
      },
    };
  }

  /**
   * Confirme l'inscription d'un utilisateur après qu'il a cliqué sur le lien
   * de vérification reçu par email.
   */
  async confirmSignup(dto: ConfirmSignupDto): Promise<{ success: boolean; message: string }> {
    const { accessToken } = dto;

    try {
      const { data: userData, error: userError } = await this.supabaseService
        .getClient()
        .auth.getUser(accessToken);

      if (userError || !userData.user) {
        this.logger.warn(`Token de confirmation invalide: ${userError?.message}`);
        throw new UnauthorizedException(
          'Le lien de confirmation est invalide ou a expiré.',
        );
      }

      const supabaseUserId = userData.user.id;

      const dbUser = await this.prisma.user.findUnique({
        where: { supabaseUserId },
      });

      if (!dbUser) {
        throw new UnauthorizedException('Utilisateur non trouvé dans le système.');
      }

      if (userData.user.email_confirmed_at) {
        this.logger.log(`Email déjà confirmé pour ${dbUser.email}`);
        return {
          success: true,
          message: 'Email déjà confirmé. Vous pouvez vous connecter.',
        };
      }

      const { error: confirmError } = await this.supabaseService
        .getAdminClient()
        .auth.admin.updateUserById(supabaseUserId, {
          email_confirm: true,
        });

      if (confirmError) {
        this.logger.error(`Erreur confirmation email: ${confirmError.message}`);
        throw new BadRequestException('Erreur lors de la confirmation de l\'email.');
      }

      await this.auditService.modification('AUTH', dbUser.id, 'Email confirmé');
      this.logger.log(`Email confirmé pour ${dbUser.email}`);
      return {
        success: true,
        message: 'Email confirmé avec succès. Vous pouvez maintenant vous connecter.',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erreur inattendue confirmSignup: ${error}`);
      throw new BadRequestException('Erreur lors de la confirmation de l\'email.');
    }
  }

  /**
   * Demande de réinitialisation de mot de passe.
   * Vérifie d'abord que l'email existe dans la base de données locale,
   * puis envoie l'email via Supabase Auth.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
    const { email } = dto;

    // Vérifier que l'email existe dans la base locale
    const dbUser = await this.prisma.user.findUnique({
      where: { email },
    });

    // Toujours retourner le même message (sécurité : ne pas révéler si l'email existe)
    const genericMessage =
      'Si cette adresse email correspond à un compte, un email de réinitialisation a été envoyé.';

    if (!dbUser || !dbUser.actif) {
      this.logger.warn(`Tentative de reset pour email inexistant/inactif: ${email}`);
      return { success: true, message: genericMessage };
    }

    try {
      // Déterminer l'URL de redirection après le reset
      const appUrl = this.configService.get<string>('cors.origin') || 'http://localhost:3000';
      const redirectTo = `${appUrl}/reset-password`;

      const { error } = await this.supabaseService
        .getClient()
        .auth.resetPasswordForEmail(email, {
          redirectTo,
        });

      if (error) {
        this.logger.error(`Erreur Supabase resetPasswordForEmail: ${error.message}`);
        throw new BadRequestException(
          'Erreur lors de l\'envoi de l\'email de réinitialisation.',
        );
      }

      this.logger.log(`Email de réinitialisation envoyé à ${email}`);
      return { success: true, message: genericMessage };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Erreur inattendue forgotPassword: ${error}`);
      return { success: true, message: genericMessage };
    }
  }

  /**
   * Réinitialisation du mot de passe avec le token Supabase.
   * Vérifie le token, puis met à jour le mot de passe via Supabase Admin API.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    const { accessToken, newPassword } = dto;

    try {
      // 1. Récupérer l'utilisateur Supabase à partir du token
      const { data: userData, error: userError } = await this.supabaseService
        .getClient()
        .auth.getUser(accessToken);

      if (userError || !userData.user) {
        this.logger.warn(`Token de reset invalide: ${userError?.message}`);
        throw new UnauthorizedException(
          'Le lien de réinitialisation est invalide ou a expiré.',
        );
      }

      const supabaseUserId = userData.user.id;

      // 2. Vérifier que l'utilisateur existe dans notre DB
      const dbUser = await this.prisma.user.findUnique({
        where: { supabaseUserId },
      });

      if (!dbUser || !dbUser.actif) {
        throw new UnauthorizedException('Compte utilisateur non trouvé ou désactivé.');
      }

      // 3. Mettre à jour le mot de passe via Supabase Admin API
      const { error: updateError } = await this.supabaseService
        .getAdminClient()
        .auth.admin.updateUserById(supabaseUserId, {
          password: newPassword,
        });

      if (updateError) {
        this.logger.error(`Erreur mise à jour mot de passe Supabase: ${updateError.message}`);
        throw new BadRequestException(
          'Erreur lors de la réinitialisation du mot de passe.',
        );
      }

      // 4. Journaliser l'action
      await this.auditService.modification('AUTH', dbUser.id, 'Réinitialisation du mot de passe');

      this.logger.log(`Mot de passe réinitialisé pour ${dbUser.email}`);
      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès.',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erreur inattendue resetPassword: ${error}`);
      throw new BadRequestException(
        'Erreur lors de la réinitialisation du mot de passe.',
      );
    }
  }
}
