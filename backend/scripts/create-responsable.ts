/**
 * Script pour créer l'utilisateur responsable@dren.mg dans Supabase Auth
 * et le lier à l'utilisateur local existant dans la base de données.
 *
 * Usage: npx ts-node scripts/create-responsable.ts
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Variables SUPABASE_URL et SUPABASE_SERVICE_KEY requises dans .env');
    process.exit(1);
  }

  const email = 'responsable@dren.mg';
  const password = 'Responsable123!';
  const nom = 'Randrianasolo Marie';
  const role = 'RESPONSABLE_INFRASTRUCTURE';

  console.log('Création de l\'utilisateur RESPONSABLE dans Supabase Auth...');
  console.log(`   Email: ${email}`);
  console.log(`   Mot de passe: ${password}`);
  console.log(`   Rôle: ${role}\n`);

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
      user_metadata: { nom, role },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    // Si l'utilisateur existe déjà (code 422), on récupère son ID
    if (response.status === 422) {
      console.log('L\'utilisateur existe déjà dans Supabase Auth. Récupération de l\'ID...');
      const listResponse = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users?filter%5Bemail%5D=${encodeURIComponent(email)}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        },
      );
      const users = await listResponse.json();
      const existingUser = users.users?.find((u: any) => u.email === email);
      if (!existingUser) {
        console.error('Impossible de trouver l\'utilisateur existant dans Supabase');
        process.exit(1);
      }
      await updatePrismaUser(existingUser.id, email, role);
      console.log(`\nUtilisateur déjà existant dans Supabase, lien mis à jour.\n   Email: ${email}\n`);
      return;
    }
    console.error('Erreur Supabase :', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  const supabaseUser = await response.json();
  console.log(`Utilisateur créé dans Supabase Auth (ID: ${supabaseUser.id})`);

  await updatePrismaUser(supabaseUser.id, email, role);

  console.log(`\nConnexion possible avec :
   Email: ${email}
   Mot de passe: ${password}
   Rôle: ${role}
   Endpoint: POST http://localhost:3000/api/auth/login\n`);
}

async function updatePrismaUser(supabaseUserId: string, email: string, role: string) {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL manquante dans .env');
    process.exit(1);
  }

  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const existing = await pool.query(
      `SELECT id FROM "utilisateur" WHERE email = $1`,
      [email],
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE "utilisateur" SET supabase_user_id = $1, role = $2, actif = true WHERE email = $3`,
        [supabaseUserId, role, email],
      );
      console.log(`Utilisateur local mis à jour (ID: ${existing.rows[0].id})`);
    } else {
      await pool.query(
        `INSERT INTO "utilisateur" (email, nom, role, supabase_user_id, actif) VALUES ($1, $2, $3, $4, true)`,
        [email, 'Randrianasolo Marie', role, supabaseUserId],
      );
      console.log('Utilisateur local créé');
    }
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
