import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;
  private supabaseAdminClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.get<string>('supabase.url');
    const anonKey = this.configService.get<string>('supabase.anonKey');
    const serviceKey = this.configService.get<string>('supabase.serviceKey');

    if (!url || !anonKey) {
      this.logger.warn(
        'Supabase non configuré. Vérifiez SUPABASE_URL et SUPABASE_ANON_KEY dans .env',
      );
    }

    this.supabaseClient = createClient(url ?? '', anonKey ?? '');

    if (serviceKey) {
      this.supabaseAdminClient = createClient(url ?? '', serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      this.supabaseAdminClient = this.supabaseClient;
    }
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdminClient;
  }
}
