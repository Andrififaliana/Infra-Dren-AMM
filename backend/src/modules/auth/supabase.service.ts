import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient | null = null;
  private supabaseAdminClient: SupabaseClient | null = null;
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.get<string>('supabase.url');
    const anonKey = this.configService.get<string>('supabase.anonKey');
    const serviceKey = this.configService.get<string>('supabase.serviceKey');

    if (!url || !anonKey) {
      this.logger.warn(
        '⚠️  Supabase non configuré. Ajoutez SUPABASE_URL et SUPABASE_ANON_KEY dans .env pour activer l\'authentification.',
      );
      return;
    }

    this.isConfigured = true;
    this.supabaseClient = createClient(url, anonKey);

    if (serviceKey) {
      this.supabaseAdminClient = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } else {
      this.supabaseAdminClient = this.supabaseClient;
    }

    this.logger.log('✅ Supabase Auth configuré avec succès');
  }

  getClient(): SupabaseClient {
    if (!this.isConfigured || !this.supabaseClient) {
      throw new Error('Supabase n\'est pas configuré. Vérifiez SUPABASE_URL et SUPABASE_ANON_KEY dans .env');
    }
    return this.supabaseClient;
  }

  getAdminClient(): SupabaseClient {
    if (!this.isConfigured || !this.supabaseAdminClient) {
      throw new Error('Supabase n\'est pas configuré. Vérifiez SUPABASE_URL et SUPABASE_ANON_KEY dans .env');
    }
    return this.supabaseAdminClient;
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}
