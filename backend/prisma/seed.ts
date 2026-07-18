import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const etats = ['BON', 'MOYEN', 'MAUVAIS'] as const;
const materiauxStructures = ['PARPAING', 'BRIQUE', 'BOIS', 'METAL', 'TERRE_BATTUE', 'BANCHE'] as const;
const materiauxMur = ['PARPAING', 'BRIQUE', 'BANCHE', 'BOIS'] as const;
const sourcesFinancement = ['ETAT', 'BANQUE_MONDIALE', 'BID', 'UNICEF', 'PAM', 'ONG', 'COMMUNAUTE', 'FONDS_PROPRES'] as const;
const agencesConstruction = ['MINISTERE_EDUCATION', 'BANQUE_MONDIALE', 'BID', 'ONG_LOCALE', 'COMMUNE', 'FONDS_PROPRES'] as const;
const fonctionsToilette = ['FILLES', 'GARCONS', 'ENSEIGNANTS', 'LATRINES'] as const;
const typesEquipement = ['MOBILIER', 'MATERIEL_DIDACTIQUE', 'MATERIEL_SCIENTIFIQUE', 'INFORMATIQUE'] as const;
const nomsEquipement: Record<string, string[]> = {
  MOBILIER: ['Table-banc', 'Bureau', 'Chaise', 'Armoire', 'Bibliothèque', 'Table', 'Etagère'],
  MATERIEL_DIDACTIQUE: ['Tableau noir', 'Tableau blanc', 'Carte géographique', 'Globe terrestre', 'Appareil de projection'],
  MATERIEL_SCIENTIFIQUE: ['Microscope', 'Balance', 'Eprouvette', 'Boussole', 'Thermomètre'],
  INFORMATIQUE: ['Ordinateur', 'Imprimante', 'Tablette', 'Projecteur'],
};

const prenomsDir = [
  'Jean', 'Marie', 'Henri', 'Pauline', 'Faly', 'Lalao', 'Rivo', 'Mamy', 'Haja', 'Soa',
  'Tiana', 'Nirina', 'Miora', 'Toky', 'Feno', 'Mbola', 'Voahirana', 'Harilala', 'Manitra', 'Tafita',
];

const nomsDir = [
  'Rakotondrazaka', 'Randrianasolo', 'Razafimandimby', 'Rajaonarison', 'Rakotoarisoa',
  'Andriamiarintsoa', 'Razanajatovo', 'Rakotomalala', 'Randriambeloma', 'Razanamparany',
  'Rakotonirina', 'Andrianantenaina', 'Rakotovao', 'Razafindrakoto', 'Ranaivoson',
];

type ZapItem = { cis: string; zap: string; communs: string[] };

const zaps: ZapItem[] = [
  { cis: 'CISCO Ambositra', zap: 'ZAP Ambositra I', communs: ['Ambositra'] },
  { cis: 'CISCO Ambositra', zap: 'ZAP Ambositra II', communs: ['Ambositra', 'Sahatsiho Ambohimanjaka'] },
  { cis: 'CISCO Ambositra', zap: 'ZAP Ilaka', communs: ['Ilaka Centre', 'Ambohibary', 'Ankazoambo'] },
  { cis: 'CISCO Ambositra', zap: 'ZAP Ivato', communs: ['Ivato', 'Isaha', 'Sandrandahy'] },
  { cis: 'CISCO Ambositra', zap: 'ZAP Tsarazaza', communs: ['Tsarazaza', 'Ambalamanakana', 'Alatsinainy Ibity'] },
  { cis: 'CISCO Ambositra', zap: 'ZAP Antoetra', communs: ['Antoetra', 'Ambinanindrano'] },
  { cis: 'CISCO Ambositra', zap: 'ZAP Imady', communs: ['Imerina Imady', 'Maintinandry', 'Andina'] },
  { cis: 'CISCO Fandriana', zap: 'ZAP Fandriana I', communs: ['Fandriana', 'Miarinavaratra'] },
  { cis: 'CISCO Fandriana', zap: 'ZAP Fandriana II', communs: ['Sahamadio', 'Tolongoina', 'Mahazoarivo'] },
  { cis: 'CISCO Fandriana', zap: 'ZAP Imito', communs: ['Imito', 'Miadanandriana'] },
  { cis: 'CISCO Fandriana', zap: 'ZAP Fiadanana', communs: ['Fiadanana', 'Andohariana', 'Ambohimahazo'] },
  { cis: 'CISCO Manandriana', zap: 'ZAP Manandriana I', communs: ['Ambovombe', 'Anjomakely', 'Ambohimahazo'] },
  { cis: 'CISCO Manandriana', zap: 'ZAP Manandriana II', communs: ['Ankarimbary', 'Ambatomarina', 'Andoharano'] },
  { cis: 'CISCO Ambatofinandrahana', zap: 'ZAP Ambatofinandrahana', communs: ['Ambatofinandrahana', 'Ambondromisotra'] },
  { cis: 'CISCO Ambatofinandrahana', zap: 'ZAP Amborompotsy', communs: ['Amborompotsy', 'Ambatomifanongoa'] },
  { cis: 'CISCO Ambatofinandrahana', zap: 'ZAP Ranotsara', communs: ['Ranotsara', 'Andohanosy', 'Soanindrariny'] },
];

function getZap(cis: string, commune: string): string | undefined {
  return zaps.find(z => z.cis === cis && z.communs.includes(commune))?.zap;
}

const communeCoords: Record<string, { lat: number; lng: number }> = {
  'Ambositra': { lat: -20.52, lng: 47.25 },
  'Sahatsiho Ambohimanjaka': { lat: -20.47, lng: 47.30 },
  'Ambohibary': { lat: -20.50, lng: 47.20 },
  'Ilaka Centre': { lat: -20.35, lng: 47.38 },
  'Ivato': { lat: -20.55, lng: 47.28 },
  'Antoetra': { lat: -20.78, lng: 47.48 },
  'Imerina Imady': { lat: -20.43, lng: 47.27 },
  'Andina': { lat: -20.48, lng: 47.18 },
  'Tsarazaza': { lat: -20.58, lng: 47.33 },
  'Sandrandahy': { lat: -20.59, lng: 47.37 },
  'Isaha': { lat: -20.56, lng: 47.25 },
  'Fandriana': { lat: -20.23, lng: 47.38 },
  'Sahamadio': { lat: -20.28, lng: 47.42 },
  'Mahazoarivo': { lat: -20.20, lng: 47.33 },
  'Miarinavaratra': { lat: -20.25, lng: 47.36 },
  'Imito': { lat: -20.18, lng: 47.40 },
  'Fiadanana': { lat: -20.30, lng: 47.35 },
  'Ambovombe': { lat: -20.57, lng: 47.07 },
  'Anjomakely': { lat: -20.55, lng: 47.05 },
  'Ankarimbary': { lat: -20.60, lng: 47.10 },
  'Ambatomarina': { lat: -20.62, lng: 47.00 },
  'Andoharano': { lat: -20.52, lng: 47.02 },
  'Ambatofinandrahana': { lat: -20.55, lng: 46.80 },
  'Ambondromisotra': { lat: -20.50, lng: 46.77 },
  'Amborompotsy': { lat: -20.60, lng: 46.85 },
  'Ambatomifanongoa': { lat: -20.53, lng: 46.82 },
  'Ranotsara': { lat: -20.48, lng: 46.90 },
};

function getCommuneCoords(commune: string): { latitude?: number; longitude?: number } {
  const base = communeCoords[commune];
  if (!base) return {};
  // Spread schools within the same commune by a small random offset (~100m)
  const offset = () => (Math.random() - 0.5) * 0.002;
  return { latitude: base.lat + offset(), longitude: base.lng + offset() };
}

function makeEtablissement(
  nom: string,
  ciscoNom: string,
  commune: string,
  fokontany: string,
  quartier: string,
): any {
  const nbEnsG = randomInt(3, 25);
  const nbEnsF = randomInt(5, 30);
  const nbSecG = randomInt(2, 12);
  const nbSecF = randomInt(3, 15);
  const nbBatiments = randomInt(1, 3);

  const sallesParBatiment = (): any[] => {
    const n = randomInt(1, 5);
    const salles: any[] = [];
    for (let i = 0; i < n; i++) {
      const niveau = randomInt(0, 3);
      const longueur = randomFloat(5, 10);
      const hauteur = randomFloat(2.5, 4);
      const estOp = Math.random() > 0.2;
      salles.push({
        sigleSalle: `S${String(niveau + 1)}${String(i + 1).padStart(2, '0')}`,
        niveauSalle: niveau,
        affectationSalle: Math.random() > 0.15 ? 'CLASSE' : pick(['LABORATOIRE', 'ADMINISTRATION', 'BIBLIOTHEQUE']),
        etatSalle: pick(etats),
        estOperationnel: estOp,
        estElectrifiee: Math.random() > 0.3,
        longueurInt: longueur,
        hauteurSP: hauteur,
        nbEleveF: estOp ? randomInt(10, 30) : 0,
        nbEleveG: estOp ? randomInt(8, 28) : 0,
        equipements: {
          create: pickN(nomsEquipement.MOBILIER, randomInt(1, 3)).map(nom => ({
            nomEquip: nom,
            typeEquip: 'MOBILIER',
            etat: pick(etats),
            quantite: randomInt(5, 30),
          })).concat(
            Math.random() > 0.5
              ? pickN(nomsEquipement.MATERIEL_DIDACTIQUE, 1).map(nom => ({
                  nomEquip: nom,
                  typeEquip: 'MATERIEL_DIDACTIQUE',
                  etat: pick(etats),
                  quantite: 1,
                }))
              : []
          ),
        },
        ouvertures: {
          create: [
            { typeOuvert: 'FENETRE', nbOuvert: randomInt(2, 6), largeurOuvert: 1.2, hauteurOuvert: 1.5, surfaceOuvert: 1.8 },
            { typeOuvert: 'PORTE', nbOuvert: 1, largeurOuvert: 0.9, hauteurOuvert: 2.1, surfaceOuvert: 1.89 },
          ],
        },
      } as any);
    }
    return salles;
  };

  const batiments: any[] = [];
  for (let b = 0; b < nbBatiments; b++) {
    const nbToilTypes = randomInt(0, 3);
    const toilettes = fonctionsToilette.slice(0, nbToilTypes).map(f => ({
      nbCompartiment: randomInt(1, 6),
      fonctionToilette: f,
      pointEau: Math.random() > 0.4,
    }));
    batiments.push({
      sigleBat: `BAT-${String.fromCharCode(65 + b)}`,
      nbNiveau: randomInt(1, 2),
      srcFic: pick(sourcesFinancement),
      agenceC: pick(agencesConstruction),
      anneeRecProvC: new Date(`${randomInt(2015, 2021)}-01-01`),
      anneeDefC: new Date(`${randomInt(2016, 2022)}-06-01`),
      dispositifAc: Math.random() > 0.5 ? 'EXTINCTEUR' : undefined,
      salles: { create: sallesParBatiment() },
      toilettes: toilettes.length > 0 ? { create: toilettes } : undefined,
    } as any);
  }

  const nbDesigs = randomInt(0, 2);
  const designations = nbDesigs > 0
    ? Array.from({ length: nbDesigs }, (_, i) => ({
        nomDesign: `Terrain ${String.fromCharCode(65 + i)}`,
        estEnceinteEtab: Math.random() > 0.3,
        estTitre: Math.random() > 0.5,
        typeDesignation: pick(['TITRE_FONCIER', 'ARRETE', 'OCCUPATION']),
        numCadastre: Math.random() > 0.3 ? `TG ${String(randomInt(10000, 99999))}` : undefined,
        superficieDesign: randomFloat(500, 8000),
        estLitigieux: Math.random() > 0.8,
      }))
    : [];

  const nbStructures = randomInt(0, 3);
  const typesStructure = ['MUR_CLOTURE', 'PORTAL', 'TERRAIN_SPORT', 'BIBLIOTHEQUE', 'LABORATOIRE', 'INFIRMERIE', 'CANTINE'];
  const structures = nbStructures > 0
    ? pickN(typesStructure, nbStructures).map(type => ({
        typeStruc: type,
        existenceStruc: Math.random() > 0.15,
        materiauxStruc: type === 'MUR_CLOTURE' || type === 'PORTAL' ? pick(materiauxMur) : pick(materiauxStructures),
        etatStruc: pick(etats),
      }))
    : [];

  const coords = getCommuneCoords(commune);
  return {
    nomEtab: nom,
    dren: "DREN Amoron'i Mania",
    cisco: ciscoNom,
    zap: getZap(ciscoNom, commune) || undefined,
    commune,
    ...coords,
    fokontany,
    quartier,
    couvTelephonique: Math.random() > 0.25,
    couvInternet: Math.random() > 0.5,
    nbEnseignantG: nbEnsG,
    nbEnseignantF: nbEnsF,
    nbSectionG: nbSecG,
    nbSectionF: nbSecF,
    directeur: {
      create: {
        nomDirecteur: pick(nomsDir),
        prenomDr: pick(prenomsDir),
        emailDr: `directeur.${nom.toLowerCase().replace(/[^a-z0-9]/g, '')}@education.mg`,
        telDr: `+261 ${randomInt(32, 34)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
      },
    },
    designations: designations.length > 0 ? { create: designations } : undefined,
    structures: structures.length > 0 ? { create: structures } : undefined,
    batiments: { create: batiments },
  };
}

const ecoles: {
  nom: string;
  cisco: string;
  commune: string;
  fokontany: string;
  quartier: string;
}[] = [
  // ── CISCO Ambositra ──────────────────────────────
  { nom: "Lycée Rakotoarisoa Ambositra", cisco: "CISCO Ambositra", commune: "Ambositra", fokontany: "Ambositra Centre", quartier: "Antsahameva" },
  { nom: "CEG Ambositra", cisco: "CISCO Ambositra", commune: "Ambositra", fokontany: "Ambositra Centre", quartier: "Andohan'Ambositra" },
  { nom: "EPP Ambositra I", cisco: "CISCO Ambositra", commune: "Ambositra", fokontany: "Ambositra Est", quartier: "Antanambao" },
  { nom: "EPP Ambositra II", cisco: "CISCO Ambositra", commune: "Ambositra", fokontany: "Ambositra Ouest", quartier: "Tsaralàna" },
  { nom: "EPP Sahatsiho Ambohimanjaka", cisco: "CISCO Ambositra", commune: "Sahatsiho Ambohimanjaka", fokontany: "Ambohimanjaka", quartier: "Centre" },
  { nom: "CEG Sahatsiho Ambohimanjaka", cisco: "CISCO Ambositra", commune: "Sahatsiho Ambohimanjaka", fokontany: "Sahatsiho", quartier: "Nord" },
  { nom: "EPP Ambohibary", cisco: "CISCO Ambositra", commune: "Ambohibary", fokontany: "Ambohibary Est", quartier: "Atsimo" },
  { nom: "CEG Ambohibary", cisco: "CISCO Ambositra", commune: "Ambohibary", fokontany: "Ambohibary Ouest", quartier: "Centre" },
  { nom: "EPP Ilaka Centre", cisco: "CISCO Ambositra", commune: "Ilaka Centre", fokontany: "Ilaka", quartier: "Andrefana" },
  { nom: "CEG Ilaka", cisco: "CISCO Ambositra", commune: "Ilaka Centre", fokontany: "Ilaka Nord", quartier: "Est" },
  { nom: "EPP Ivato", cisco: "CISCO Ambositra", commune: "Ivato", fokontany: "Ivato Centre", quartier: "Ambatobe" },
  { nom: "CEG Ivato", cisco: "CISCO Ambositra", commune: "Ivato", fokontany: "Ivato Atsimo", quartier: "Andoharanofotsy" },
  { nom: "EPP Antoetra", cisco: "CISCO Ambositra", commune: "Antoetra", fokontany: "Antoetra", quartier: "Zafimaniry" },
  { nom: "EPP Imerina Imady", cisco: "CISCO Ambositra", commune: "Imerina Imady", fokontany: "Imady Centre", quartier: "Ambony" },
  { nom: "CEG Andina", cisco: "CISCO Ambositra", commune: "Andina", fokontany: "Andina", quartier: "Firaisana" },
  { nom: "EPP Tsarazaza", cisco: "CISCO Ambositra", commune: "Tsarazaza", fokontany: "Tsarazaza", quartier: "Centre" },
  { nom: "EPP Sandrandahy", cisco: "CISCO Ambositra", commune: "Sandrandahy", fokontany: "Sandrandahy", quartier: "Ambohimanarina" },
  { nom: "CEG Isaha", cisco: "CISCO Ambositra", commune: "Isaha", fokontany: "Isaha", quartier: "Atsimo" },

  // ── CISCO Fandriana ──────────────────────────────
  { nom: "Lycée Fandriana", cisco: "CISCO Fandriana", commune: "Fandriana", fokontany: "Fandriana Centre", quartier: "Antsahameva" },
  { nom: "CEG Fandriana", cisco: "CISCO Fandriana", commune: "Fandriana", fokontany: "Fandriana Est", quartier: "Ambony" },
  { nom: "EPP Fandriana I", cisco: "CISCO Fandriana", commune: "Fandriana", fokontany: "Fandriana Centre", quartier: "Andrefana" },
  { nom: "EPP Fandriana II", cisco: "CISCO Fandriana", commune: "Fandriana", fokontany: "Fandriana Ouest", quartier: "Atsimo" },
  { nom: "EPP Sahamadio", cisco: "CISCO Fandriana", commune: "Sahamadio", fokontany: "Sahamadio Centre", quartier: "Nord" },
  { nom: "CEG Sahamadio", cisco: "CISCO Fandriana", commune: "Sahamadio", fokontany: "Sahamadio Atsimo", quartier: "Est" },
  { nom: "Lycée Technique Fandriana", cisco: "CISCO Fandriana", commune: "Fandriana", fokontany: "Fandriana Nord", quartier: "Ankadivory" },
  { nom: "EPP Mahazoarivo", cisco: "CISCO Fandriana", commune: "Mahazoarivo", fokontany: "Mahazoarivo", quartier: "Firaisana" },
  { nom: "CEG Miarinavaratra", cisco: "CISCO Fandriana", commune: "Miarinavaratra", fokontany: "Miarinavaratra", quartier: "Ambany" },
  { nom: "EPP Imito", cisco: "CISCO Fandriana", commune: "Imito", fokontany: "Imito", quartier: "Andrefana" },
  { nom: "CEG Fiadanana", cisco: "CISCO Fandriana", commune: "Fiadanana", fokontany: "Fiadanana", quartier: "Centre" },

  // ── CISCO Manandriana ────────────────────────────
  { nom: "CEG Manandriana", cisco: "CISCO Manandriana", commune: "Ambovombe", fokontany: "Manandriana Centre", quartier: "Antaninarenina" },
  { nom: "Lycée Manandriana", cisco: "CISCO Manandriana", commune: "Ambovombe", fokontany: "Ambovombe", quartier: "Est" },
  { nom: "EPP Ambovombe", cisco: "CISCO Manandriana", commune: "Ambovombe", fokontany: "Ambovombe Nord", quartier: "Ouest" },
  { nom: "EPP Anjomakely", cisco: "CISCO Manandriana", commune: "Anjomakely", fokontany: "Anjomakely", quartier: "Firaisana" },
  { nom: "CEG Ankarimbary", cisco: "CISCO Manandriana", commune: "Ankarimbary", fokontany: "Ankarimbary", quartier: "Atsimo" },
  { nom: "EPP Ambatomarina", cisco: "CISCO Manandriana", commune: "Ambatomarina", fokontany: "Ambatomarina", quartier: "Centre" },
  { nom: "CEG Andoharano", cisco: "CISCO Manandriana", commune: "Andoharano", fokontany: "Andoharano", quartier: "Nord" },

  // ── CISCO Ambatofinandrahana ──────────────────────
  { nom: "Lycée Ambatofinandrahana", cisco: "CISCO Ambatofinandrahana", commune: "Ambatofinandrahana", fokontany: "Ambatofinandrahana Centre", quartier: "Antsahameva" },
  { nom: "CEG Ambatofinandrahana", cisco: "CISCO Ambatofinandrahana", commune: "Ambatofinandrahana", fokontany: "Ambatofinandrahana Est", quartier: "Andrefana" },
  { nom: "EPP Ambatofinandrahana I", cisco: "CISCO Ambatofinandrahana", commune: "Ambatofinandrahana", fokontany: "Ambatofinandrahana Centre", quartier: "Ambony" },
  { nom: "EPP Ambatofinandrahana II", cisco: "CISCO Ambatofinandrahana", commune: "Ambatofinandrahana", fokontany: "Ambatofinandrahana Ouest", quartier: "Atsimo" },
  { nom: "CEG Ambondromisotra", cisco: "CISCO Ambatofinandrahana", commune: "Ambondromisotra", fokontany: "Ambondromisotra", quartier: "Centre" },
  { nom: "EPP Amborompotsy", cisco: "CISCO Ambatofinandrahana", commune: "Amborompotsy", fokontany: "Amborompotsy", quartier: "Antsahameva" },
  { nom: "CEG Ambatomifanongoa", cisco: "CISCO Ambatofinandrahana", commune: "Ambatomifanongoa", fokontany: "Ambatomifanongoa", quartier: "Firaisana" },
  { nom: "EPP Ranotsara", cisco: "CISCO Ambatofinandrahana", commune: "Ranotsara", fokontany: "Ranotsara", quartier: "Nord" },
];

async function main() {
  console.log('🌱 Début du seed DREN Amoron\'i Mania...\n');

  // 1. Utilisateurs
  console.log('👤 Création des utilisateurs...');
  await prisma.user.upsert({
    where: { email: 'admin@amm.mg' },
    update: {},
    create: {
      email: 'admin@amm.mg',
      nom: 'Rakotoarisoa Jean',
      role: 'ADMIN',
      supabaseUserId: 'seed-admin-amm',
    },
  });
  await prisma.user.upsert({
    where: { email: 'responsable@amm.mg' },
    update: {},
    create: {
      email: 'responsable@amm.mg',
      nom: 'Randrianasolo Marie',
      role: 'RESPONSABLE_INFRASTRUCTURE',
      supabaseUserId: 'seed-resp-amm',
    },
  });

  // 2. Nettoyage des données existantes (ordre inverse des dépendances)
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.effetAleat.deleteMany();
  await prisma.log.deleteMany();
  await prisma.ouverture.deleteMany();
  await prisma.equipement.deleteMany();
  await prisma.salle.deleteMany();
  await prisma.toilette.deleteMany();
  await prisma.batiment.deleteMany();
  await prisma.directeur.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.structure.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.etablissement.deleteMany();
  await prisma.trajet.deleteMany();
  await prisma.periodeDifficile.deleteMany();
  await prisma.moyens.deleteMany();
  await prisma.alea.deleteMany();

  // 3. Création des établissements
  console.log(`🏫 Création de ${ecoles.length} établissements...`);
  for (const ecole of ecoles) {
    const data = makeEtablissement(ecole.nom, ecole.cisco, ecole.commune, ecole.fokontany, ecole.quartier);
    await prisma.etablissement.create({ data: data as any });
  }
  console.log(`   ✅ ${ecoles.length} établissements créés`);

  // 4. Trajets
  console.log('🚗 Création des trajets...');
  const trajetsData = [
    {
      nomTrajet: 'Ambositra → Fandriana',
      typeMoyen: 'TAXI-BROUSSE', duree: 60, distance: 45,
      debutPeriode: new Date('2024-01-15'), finPeriode: new Date('2024-03-15'),
    },
    {
      nomTrajet: 'Ambositra → Ambatofinandrahana',
      typeMoyen: 'TAXI-BROUSSE', duree: 120, distance: 85,
    },
    {
      nomTrajet: 'Ambositra → Manandriana',
      typeMoyen: 'BUS', duree: 45, distance: 35,
    },
    {
      nomTrajet: 'Ambositra → Antoetra',
      typeMoyen: 'PIED', duree: 150, distance: 18,
      debutPeriode: new Date('2024-01-01'), finPeriode: new Date('2024-04-30'),
    },
    {
      nomTrajet: 'Fandriana → Sahamadio',
      typeMoyen: 'PIED', duree: 90, distance: 10,
    },
    {
      nomTrajet: 'Ambositra → Ilaka',
      typeMoyen: 'BUS', duree: 30, distance: 20,
    },
    {
      nomTrajet: 'Ambositra → Ivato',
      typeMoyen: 'TAXI-BROUSSE', duree: 75, distance: 55,
      debutPeriode: new Date('2024-12-01'), finPeriode: new Date('2025-02-28'),
    },
  ];

  const trajets: any[] = [];
  for (const t of trajetsData) {
    const trajet = await prisma.trajet.create({
      data: {
        nomTrajet: t.nomTrajet,
        debutTrajet: new Date('2024-01-01'),
        finTrajet: new Date('2024-12-31'),
        moyens: {
          create: { typeMoyen: t.typeMoyen, dureeMoyen: t.duree, distanceMoyen: t.distance },
        },
        ...(t.debutPeriode
          ? {
              periode: {
                create: { debutPeriode: t.debutPeriode, finPeriode: t.finPeriode },
              },
            }
          : {}),
      },
    });
    trajets.push(trajet);
  }
  console.log(`   ✅ ${trajets.length} trajets créés`);

  // 5. Aléas
  console.log('🌧️ Création des aléas...');
  const aleasData = [
    {
      typeAleat: 'INONDATION',
      nomAleat: 'Inondation Ambositra',
      dateAleat: new Date('2024-02-10'),
      explication: 'Fortes pluies ayant provoqué l\'inondation du Lycée Rakotoarisoa Ambositra',
      trajetIdx: 0,
      nbElevesG: 45, nbElevesF: 38, nbEnseignG: 5, nbEnseignF: 3,
    },
    {
      typeAleat: 'VENT',
      nomAleat: 'Cyclone Manandriana',
      dateAleat: new Date('2024-03-05'),
      explication: 'Toiture du CEG Manandriana partiellement endommagée',
      trajetIdx: 2,
      nbElevesG: 30, nbElevesF: 25, nbEnseignG: 4, nbEnseignF: 2,
    },
    {
      typeAleat: 'GLOISSEMENT_TERRAIN',
      nomAleat: 'Glissement Antoetra',
      dateAleat: new Date('2024-01-20'),
      explication: 'Route coupée entre Ambositra et Antoetra après un glissement de terrain',
      trajetIdx: 3,
      nbElevesG: 15, nbElevesF: 12, nbEnseignG: 2, nbEnseignF: 1,
    },
    {
      typeAleat: 'SECHERESSE',
      nomAleat: 'Sécheresse Ambatofinandrahana',
      dateAleat: new Date('2024-09-15'),
      explication: 'Pénurie d\'eau potable dans les écoles de la région',
      trajetIdx: 1,
      nbElevesG: 60, nbElevesF: 55, nbEnseignG: 8, nbEnseignF: 6,
    },
    {
      typeAleat: 'INCENDIE',
      nomAleat: 'Incendie Fandriana',
      dateAleat: new Date('2024-07-22'),
      explication: 'Incendie de brousse ayant touché les infrastructures scolaires',
      trajetIdx: 4,
      nbElevesG: 20, nbElevesF: 18, nbEnseignG: 3, nbEnseignF: 2,
    },
  ];

  for (const a of aleasData) {
    await prisma.alea.create({
      data: {
        typeAleat: a.typeAleat,
        nomAleat: a.nomAleat,
        dateAleat: a.dateAleat,
        explication: a.explication,
        effets: {
          create: [{
            trajetId: trajets[a.trajetIdx].idTrajet,
            nbElevesG: a.nbElevesG,
            nbElevesF: a.nbElevesF,
            nbEnseignG: a.nbEnseignG,
            nbEnseignF: a.nbEnseignF,
          }],
        },
      },
    });
  }
  console.log(`   ✅ ${aleasData.length} aléas créés`);

  // 6. Log initial
  console.log('📝 Création du log...');
  await prisma.log.create({
    data: {
      action: 'CREATE',
      entity: 'SEED',
      details: "Initialisation de la base de données DREN Amoron'i Mania",
    },
  });

  // Résumé
  const stats = {
    etablissements: await prisma.etablissement.count(),
    batiments: await prisma.batiment.count(),
    salles: await prisma.salle.count(),
    equipements: await prisma.equipement.count(),
    toilettes: await prisma.toilette.count(),
    trajets: await prisma.trajet.count(),
    aleas: await prisma.alea.count(),
    users: await prisma.user.count(),
  };

  console.log('\n═══════════════════════════════════════════');
  console.log('✅ Seed DREN Amoron\'i Mania terminé !');
  console.log('═══════════════════════════════════════════');
  console.log(`   📊 Résumé :`);
  console.log(`   🏫 Établissements  : ${stats.etablissements}`);
  console.log(`   🏢 Bâtiments       : ${stats.batiments}`);
  console.log(`   🚪 Salles          : ${stats.salles}`);
  console.log(`   📦 Équipements     : ${stats.equipements}`);
  console.log(`   🚽 Toilettes       : ${stats.toilettes}`);
  console.log(`   🚗 Trajets         : ${stats.trajets}`);
  console.log(`   🌧️ Aléas           : ${stats.aleas}`);
  console.log(`   👤 Utilisateurs    : ${stats.users}`);
  console.log('═══════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
