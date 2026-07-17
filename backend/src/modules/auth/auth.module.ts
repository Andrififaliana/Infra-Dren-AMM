import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, JwtAuthGuard, RolesGuard],
  exports: [SupabaseService, AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
