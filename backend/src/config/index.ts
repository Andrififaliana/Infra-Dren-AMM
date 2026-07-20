export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    anonKey:
      process.env.SUPABASE_ANON_KEY ??
      process.env.SUPABASE_PUBLISHABLE_KEY ??
      '',
    serviceKey:
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? '',
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    bucketName: process.env.R2_BUCKET_NAME ?? 'infradrenphotos',
    endpoint: `https://${process.env.R2_ACCOUNT_ID ?? ''}.r2.cloudflarestorage.com`,
    publicUrlBase: `https://${process.env.R2_BUCKET_NAME ?? 'infradrenphotos'}.${process.env.R2_ACCOUNT_ID ?? ''}.r2.cloudflarestorage.com`,
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*',
  },
  ia: {
    apiKey: process.env.OPEN_API_KEY ?? '',
    baseUrl: process.env.IA_API_URL ?? 'https://api.groq.com/openai/v1',
    model: process.env.IA_MODEL ?? 'llama-3.3-70b-versatile',
  },
});
