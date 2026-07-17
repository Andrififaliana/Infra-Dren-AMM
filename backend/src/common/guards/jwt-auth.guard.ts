import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../constants';
import { SupabaseService } from '../../modules/auth/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    try {
      const { data: { user: supabaseUser }, error } =
        await this.supabaseService.getClient().auth.getUser(token);

      if (error || !supabaseUser) {
        throw new UnauthorizedException('Token invalide ou expiré');
      }

      const dbUser = await this.prisma.user.findUnique({
        where: { supabaseUserId: supabaseUser.id },
      });

      if (!dbUser) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      if (!dbUser.actif) {
        throw new UnauthorizedException('Compte utilisateur désactivé');
      }

      request.user = {
        id: dbUser.id,
        email: dbUser.email,
        nom: dbUser.nom,
        role: dbUser.role,
        supabaseUserId: dbUser.supabaseUserId,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erreur d\'authentification');
    }
  }

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
