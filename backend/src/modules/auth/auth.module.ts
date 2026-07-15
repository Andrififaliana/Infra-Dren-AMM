import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseService],
  exports: [SupabaseService, AuthService],
})
export class AuthModule {}
