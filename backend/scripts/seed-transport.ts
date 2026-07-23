/**
 * Script : seed-transport.ts
 *
 * Lie les trajets et aléas existants aux établissements via les tables pivots
 * EtablissementTrajet et EtablissementAlea.
 *
 * Usage : npx ts-node scripts/seed-transport.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function ensureTables() {
  console.log('→ Vérification/création des tables pivots...');
  // Créer les tables si elles n'existent pas (migration non appliquée)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS etablissement_alea (
      etablissement_id INTEGER NOT NULL REFERENCES etablissement(id_etab) ON DELETE CASCADE,
      alea_id INTEGER NOT NULL REFERENCES alea(id_aleat) ON DELETE CASCADE,
      PRIMARY KEY (etablissement_id, alea_id)
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS etablissement_trajet (
      etablissement_id INTEGER NOT NULL REFERENCES etablissement(id_etab) ON DELETE CASCADE,
      trajet_id INTEGER NOT NULL REFERENCES trajet(id_trajet) ON DELETE CASCADE,
      PRIMARY KEY (etablissement_id, trajet_id)
    )
  `);
  console.log('→ Tables OK');
}

async function main() {
  console.log('=== Seed Transport : Liaison trajets/aleas aux établissements ===\n');

  await ensureTables();

  // 1. Récupérer tous les établissements
  const etablissements = await prisma.etablissement.findMany({
    select: { id: true, nomEtab: true, commune: true },
  });
  console.log(`→ ${etablissements.length} établissements trouvés`);

  // 2. Regrouper les établissements par commune
  const byCommune = new Map<string, number[]>();
  for (const e of etablissements) {
    if (!e.commune) continue;
    const key = e.commune.toLowerCase().trim();
    if (!byCommune.has(key)) byCommune.set(key, []);
    byCommune.get(key)!.push(e.id);
  }

  // 3. Récupérer tous les trajets
  const trajets = await prisma.trajet.findMany({
    include: { moyens: true },
  });
  console.log(`→ ${trajets.length} trajets trouvés`);

  // 4. Ajouter des trajets supplémentaires pour couvrir plus de communes
  const trajetsSupplementaires = [
    { nom: 'Ambositra → Sahatsiho Ambohimanjaka', typeMoyen: 'PIED', duree: 45, distance: 5 },
    { nom: 'Ambositra → Ambohibary', typeMoyen: 'TAXI-BROUSSE', duree: 25, distance: 15 },
    { nom: 'Fandriana → Mahazoarivo', typeMoyen: 'PIED', duree: 60, distance: 8 },
    { nom: 'Fandriana → Imito', typeMoyen: 'TAXI-BROUSSE', duree: 35, distance: 20 },
    { nom: 'Fandriana → Fiadanana', typeMoyen: 'BUS', duree: 40, distance: 25 },
    { nom: 'Ambatofinandrahana → Amborompotsy', typeMoyen: 'TAXI-BROUSSE', duree: 50, distance: 30 },
    { nom: 'Ambatofinandrahana → Ranotsara', typeMoyen: 'BUS', duree: 40, distance: 22 },
    { nom: 'Manandriana → Ankarimbary', typeMoyen: 'TAXI-BROUSSE', duree: 30, distance: 18 },
    { nom: 'Manandriana → Ambatomarina', typeMoyen: 'PIED', duree: 55, distance: 7 },
    { nom: 'Ambositra → Tsarazaza', typeMoyen: 'TAXI-BROUSSE', duree: 50, distance: 30 },
    { nom: 'Ambositra → Imerina Imady', typeMoyen: 'PIED', duree: 70, distance: 8 },
    { nom: 'Ambositra → Andina', typeMoyen: 'TAXI-BROUSSE', duree: 40, distance: 22 },
    { nom: 'Fandriana → Miarinavaratra', typeMoyen: 'PIED', duree: 30, distance: 5 },
    { nom: 'Ambatofinandrahana → Ambondromisotra', typeMoyen: 'TAXI-BROUSSE', duree: 20, distance: 10 },
    { nom: 'Ambatofinandrahana → Ambatomifanongoa', typeMoyen: 'PIED', duree: 45, distance: 6 },
  ];

  let nouveauxTrajets = 0;
  for (const t of trajetsSupplementaires) {
    const exists = trajets.some(ex => ex.nomTrajet === t.nom);
    if (!exists) {
      const created = await prisma.trajet.create({
        data: {
          nomTrajet: t.nom,
          debutTrajet: new Date('2024-01-01'),
          finTrajet: new Date('2024-12-31'),
          moyens: {
            create: { typeMoyen: t.typeMoyen, dureeMoyen: t.duree, distanceMoyen: t.distance },
          },
        },
      });
      trajets.push(created as any);
      nouveauxTrajets++;
    }
  }
  console.log(`→ ${nouveauxTrajets} nouveaux trajets créés`);

  // 5. Lier les trajets aux établissements via la commune et le nom de l'établissement
  let liensTrajets = 0;
  let trajetsSansMatch = 0;

  for (const trajet of trajets) {
    if (!trajet.nomTrajet) continue;
    // Extraire les mots-clés du nom du trajet (ex: "Ambositra → Fandriana")
    const parts = trajet.nomTrajet
      .replace(/[→\-–—]/g, ' ')  // remplacer les séparateurs par des espaces
      .split(/\s+/)
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 2); // ignorer les mots trop courts
    const etablissementIds = new Set<number>();

    for (const part of parts) {
      // Cherche une commune qui contient ce mot
      for (const [commune, ids] of byCommune) {
        if (commune.includes(part)) {
          ids.forEach(id => etablissementIds.add(id));
        }
      }
      // Cherche aussi dans le nom de l'établissement
      for (const etab of etablissements) {
        if (etab.nomEtab.toLowerCase().includes(part)) {
          etablissementIds.add(etab.id);
        }
      }
    }

    if (etablissementIds.size === 0) {
      console.warn(`⚠️  Trajet "${trajet.nomTrajet}" n'a matché aucun établissement (mots: ${parts.join(', ')})`);
      trajetsSansMatch++;
      continue;
    }

    // Créer les liens
    for (const etablissementId of etablissementIds) {
      await prisma.etablissementTrajet.upsert({
        where: { etablissementId_trajetId: { etablissementId, trajetId: trajet.idTrajet } },
        create: { etablissementId, trajetId: trajet.idTrajet },
        update: {},
      });
      liensTrajets++;
    }
  }
  console.log(`→ ${liensTrajets} liens trajet-établissement créés`);
  if (trajetsSansMatch > 0) console.warn(`⚠️  ${trajetsSansMatch} trajets sans match`);

  // 6. Lier les aléas aux établissements via les trajets déjà liés
  // On utilise une requête directe sur les liens trajets déjà créés
  const liensTrajetsExistants = await prisma.etablissementTrajet.findMany({
    include: { trajet: { include: { effets: true } } },
  });
  console.log(`→ ${liensTrajetsExistants.length} liens trajets existants pour le matching des aléas`);

  // Map: trajetId → etablissementIds
  const trajetToEtab = new Map<number, number[]>();
  for (const lt of liensTrajetsExistants) {
    if (!trajetToEtab.has(lt.trajetId)) trajetToEtab.set(lt.trajetId, []);
    trajetToEtab.get(lt.trajetId)!.push(lt.etablissementId);
  }

  const aleas = await prisma.alea.findMany({
    include: { effets: true },
  });
  console.log(`→ ${aleas.length} aléas trouvés`);

  let liensAleas = 0;
  for (const alea of aleas) {
    const etablissementIds = new Set<number>();
    for (const effet of alea.effets) {
      const ids = trajetToEtab.get(effet.trajetId) ?? [];
      ids.forEach(id => etablissementIds.add(id));
    }
    for (const etablissementId of etablissementIds) {
      await prisma.etablissementAlea.upsert({
        where: { etablissementId_aleaId: { etablissementId, aleaId: alea.idAleat } },
        create: { etablissementId, aleaId: alea.idAleat },
        update: {},
      });
      liensAleas++;
    }
  }
  console.log(`→ ${liensAleas} liens aléa-établissement créés`);

  // 7. Résumé
  console.log('\n=== Seed Transport terminé ===');
  console.log(`Trajets liés   : ${liensTrajets}`);
  console.log(`Aléas liés     : ${liensAleas}`);
  console.log(`Total trajets  : ${await prisma.trajet.count()}`);
  console.log(`Liens trajets  : ${await prisma.etablissementTrajet.count()}`);
  console.log(`Liens aléas    : ${await prisma.etablissementAlea.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
