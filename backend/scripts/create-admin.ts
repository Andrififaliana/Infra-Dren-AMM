/**
 * Script pour créer un utilisateur administrateur dans Supabase Auth
 * et le lier à l'utilisateur local dans la base de données.
 * 
 * Usage: npx ts-node scripts/create-admin.ts
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Variables SUPABASE_URL et SUPABASE_SERVICE_KEY requises dans .env');
    process.exit(1);
  }

  const email = 'admin@dren.mg';
  const password = 'Admin123!';

  console.log('🔐 Création de l\'utilisateur ADMIN dans Supabase Auth...');
  console.log(`   Email: ${email}`);
  console.log(`   Mot de passe: ${password}\n`);

  // 1. Créer l'utilisateur dans Supabase Auth via l'API admin
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nom: 'Rakotoarisoa Jean',
        role: 'ADMIN',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Erreur Supabase :', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  const supabaseUser = await response.json();
  console.log(`✅ Utilisateur créé dans Supabase Auth (ID: ${supabaseUser.id})`);

  // 2. Mettre à jour l'utilisateur local avec le supabaseUserId
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const existing = await pool.query(
      `SELECT id FROM "utilisateur" WHERE email = $1`,
      [email],
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE "utilisateur" SET supabase_user_id = $1, role = 'ADMIN', actif = true WHERE email = $2`,
        [supabaseUser.id, email],
      );
      console.log(`✅ Utilisateur local mis à jour (ID: ${existing.rows[0].id})`);
    } else {
      await pool.query(
        `INSERT INTO "utilisateur" (email, nom, role, supabase_user_id, actif) VALUES ($1, $2, 'ADMIN', $3, true)`,
        [email, 'Rakotoarisoa Jean', supabaseUser.id],
      );
      console.log('✅ Utilisateur local créé');
    }

    console.log(`\n🎉 Connexion possible avec :
   Email: ${email}
   Mot de passe: ${password}
   Endpoint: POST http://localhost:3000/api/auth/login\n`);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
