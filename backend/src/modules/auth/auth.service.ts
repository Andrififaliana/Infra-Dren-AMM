import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { SupabaseService } from './supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      this.logger.warn(`Échec de connexion pour ${email}: ${error?.message}`);
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

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .auth.admin.createUser({
        email,
        password,
        email_confirm: true,
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

    const dbUser = await this.prisma.user.create({
      data: {
        email,
        nom,
        role: role ?? 'RESPONSABLE_INFRASTRUCTURE',
        supabaseUserId: data.user.id,
      },
    });

    return {
      id: dbUser.id,
      email: dbUser.email,
      nom: dbUser.nom,
      role: dbUser.role,
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


}
