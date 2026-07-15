import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../auth/supabase.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, nom, password, role } = createUserDto;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nom, role: role ?? 'RESPONSABLE_INFRASTRUCTURE' },
      });

    if (error) {
      this.logger.error(`Erreur Supabase: ${error.message}`);
      throw new ConflictException(
        `Erreur lors de la création dans Supabase: ${error.message}`,
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        nom,
        role: role ?? 'RESPONSABLE_INFRASTRUCTURE',
        supabaseUserId: data.user!.id,
      },
    });

    await this.auditService.creation('USER', user.id, email);
    return user;
  }

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, role, actif } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (actif !== undefined) where.actif = actif === 'true';

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit,
        select: { id: true, email: true, nom: true, role: true, actif: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, nom: true, role: true, actif: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException(`Utilisateur #${id} non trouvé`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur #${id} non trouvé`);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: updateUserDto.email } });
      if (existing) throw new ConflictException('Cet email est déjà utilisé');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { email: updateUserDto.email, nom: updateUserDto.nom, role: updateUserDto.role, actif: updateUserDto.actif },
    });

    await this.auditService.modification('USER', id, updatedUser.email);
    return updatedUser;
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur #${id} non trouvé`);

    await this.prisma.user.delete({ where: { id } });

    try {
      if (user.supabaseUserId) {
        await this.supabaseService.getAdminClient().auth.admin.deleteUser(user.supabaseUserId);
      }
    } catch (error) {
      this.logger.warn(`Impossible de supprimer l'utilisateur Supabase: ${error}`);
    }

    await this.auditService.suppression('USER', id);
  }
}
