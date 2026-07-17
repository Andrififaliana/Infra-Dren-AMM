import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type UserSeed = {
  email: string;
  nom: string;
  role: 'ADMIN' | 'RESPONSABLE_INFRASTRUCTURE';
  supabaseUserId?: string;
};

const usersToSeed: UserSeed[] = [
  {
    email: 'admin@dren.mg',
    nom: 'Rakotoarisoa Jean',
    role: 'ADMIN',
    supabaseUserId: 'seed-admin',
  },
  {
    email: 'responsable@dren.mg',
    nom: 'Randrianasolo Marie',
    role: 'RESPONSABLE_INFRASTRUCTURE',
    supabaseUserId: 'seed-resp1',
  },
];

async function main() {
  console.log('Début du seed utilisateurs...');

  for (const user of usersToSeed) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        nom: user.nom,
        role: user.role,
        actif: true,
        ...(user.supabaseUserId ? { supabaseUserId: user.supabaseUserId } : {}),
      },
      create: {
        email: user.email,
        nom: user.nom,
        role: user.role,
        actif: true,
        ...(user.supabaseUserId ? { supabaseUserId: user.supabaseUserId } : {}),
      },
    });

    console.log(`${created.email} -> ${created.role}`);
  }

  console.log('\nSeed utilisateurs terminé avec succès');
}

main()
  .catch((error) => {
    console.error('❌Erreur lors du seed utilisateurs :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
