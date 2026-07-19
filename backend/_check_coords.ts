import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.etablissement.count();
  const withCoords = await prisma.etablissement.count({ where: { latitude: { not: null } } });
  const samples = await prisma.etablissement.findMany({ take: 3, select: { id: true, nomEtab: true, latitude: true, longitude: true } });
  console.log(`Total établissements: ${total}`);
  console.log(`Avec coordonnées GPS: ${withCoords}`);
  console.log('Échantillons:', JSON.stringify(samples, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
