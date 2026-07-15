import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Début du seed...\n');

  // 1. Création des utilisateurs
  console.log('👤 Création des utilisateurs...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dren.mg' },
    update: {},
    create: {
      email: 'admin@dren.mg',
      nom: 'Rakotoarisoa Jean',
      role: 'ADMIN',
      supabaseUserId: 'seed-admin',
    },
  });

  const resp1 = await prisma.user.upsert({
    where: { email: 'responsable@dren.mg' },
    update: {},
    create: {
      email: 'responsable@dren.mg',
      nom: 'Randrianasolo Marie',
      role: 'RESPONSABLE_INFRASTRUCTURE',
      supabaseUserId: 'seed-resp1',
    },
  });

  // 2. Création des établissements avec toutes leurs relations
  console.log('🏫 Création des établissements...');

  // Établissement 1: École Primaire d'Ambohimanarina
  const ecole1 = await prisma.etablissement.create({
    data: {
      nomEtab: 'École Primaire Publique d\'Ambohimanarina',
      dren: 'DREN Analamanga',
      cisco: 'CISCO Antananarivo-Renivohitra',
      commune: 'Ambohimanarina',
      fokontany: 'Ambohimanarina Centre',
      quartier: 'Quartier A',
      couvTelephonique: true,
      couvInternet: true,
      nbEnseignantG: 8,
      nbEnseignantF: 12,
      nbSectionG: 6,
      nbSectionF: 8,

      directeur: {
        create: {
          nomDirecteur: 'Rakotondrazaka',
          prenomDr: 'Henri',
          emailDr: 'directeur.ambohimanarina@education.mg',
          telDr: '+261 34 12 345 67',
        },
      },

      designations: {
        create: [
          {
            nomDesign: 'Terrain A',
            estEnceinteEtab: true,
            estTitre: true,
            typeDesignation: 'TITRE_FONCIER',
            numCadastre: 'TG 12345',
            superficieDesign: 2500.0,
            estLitigieux: false,
          },
        ],
      },

      structures: {
        create: [
          { typeStruc: 'MUR_CLOTURE', existenceStruc: true, materiauxStruc: 'PARPAING', etatStruc: 'BON' },
          { typeStruc: 'PORTAL', existenceStruc: true, materiauxStruc: 'METAL', etatStruc: 'MOYEN' },
          { typeStruc: 'TERRAIN_SPORT', existenceStruc: true, materiauxStruc: 'TERRE_BATTUE', etatStruc: 'MAUVAIS' },
        ],
      },

      batiments: {
        create: [
          {
            sigleBat: 'BAT-A',
            nbNiveau: 1,
            srcFic: 'BANQUE_MONDIALE',
            agenceC: 'BANQUE_MONDIALE',
            anneeRecProvC: new Date('2018-01-01'),
            anneeDefC: new Date('2019-06-01'),
            anneeR: new Date('2023-03-01'),
            dispositifAc: 'EXTINCTEUR',
            salles: {
              create: [
                {
                  sigleSalle: 'CLASSE-01',
                  niveauSalle: 0,
                  affectationSalle: 'CLASSE',
                  etatSalle: 'BON',
                  estOperationnel: true,
                  estElectrifiee: true,
                  longueurInt: 8.0,
                  hauteurSP: 3.5,
                  nbEleveF: 15,
                  nbEleveG: 17,
                  equipements: {
                    create: [
                      { nomEquip: 'Table-banc', typeEquip: 'MOBILIER', etat: 'BON', quantite: 20 },
                      { nomEquip: 'Tableau noir', typeEquip: 'MATERIEL_DIDACTIQUE', etat: 'MOYEN', quantite: 1 },
                      { nomEquip: 'Bibliothèque', typeEquip: 'MOBILIER', etat: 'BON', quantite: 1 },
                    ],
                  },
                  ouvertures: {
                    create: [
                      { typeOuvert: 'FENETRE', nbOuvert: 4, largeurOuvert: 1.2, hauteurOuvert: 1.5, surfaceOuvert: 1.8 },
                      { typeOuvert: 'PORTE', nbOuvert: 1, largeurOuvert: 0.9, hauteurOuvert: 2.1, surfaceOuvert: 1.89 },
                    ],
                  },
                },
                {
                  sigleSalle: 'CLASSE-02',
                  niveauSalle: 0,
                  affectationSalle: 'CLASSE',
                  etatSalle: 'MOYEN',
                  estOperationnel: true,
                  estElectrifiee: true,
                  longueurInt: 7.5,
                  hauteurSP: 3.2,
                  nbEleveF: 14,
                  nbEleveG: 16,
                  equipements: {
                    create: [
                      { nomEquip: 'Table-banc', typeEquip: 'MOBILIER', etat: 'MOYEN', quantite: 18 },
                      { nomEquip: 'Tableau noir', typeEquip: 'MATERIEL_DIDACTIQUE', etat: 'MAUVAIS', quantite: 1 },
                    ],
                  },
                },
                {
                  sigleSalle: 'BUREAU-DIR',
                  niveauSalle: 0,
                  affectationSalle: 'ADMINISTRATION',
                  etatSalle: 'BON',
                  estOperationnel: true,
                  estElectrifiee: true,
                  longueurInt: 4.0,
                  hauteurSP: 3.0,
                  nbEleveF: 0,
                  nbEleveG: 0,
                  equipements: {
                    create: [
                      { nomEquip: 'Bureau', typeEquip: 'MOBILIER', etat: 'BON', quantite: 1 },
                      { nomEquip: 'Chaise', typeEquip: 'MOBILIER', etat: 'BON', quantite: 3 },
                      { nomEquip: 'Armoire', typeEquip: 'MOBILIER', etat: 'MOYEN', quantite: 2 },
                    ],
                  },
                },
              ],
            },
            toilettes: {
              create: [
                { nbCompartiment: 4, fonctionToilette: 'FILLES', pointEau: true },
                { nbCompartiment: 3, fonctionToilette: 'GARCONS', pointEau: true },
                { nbCompartiment: 1, fonctionToilette: 'ENSEIGNANTS', pointEau: true },
              ],
            },
          },
          {
            sigleBat: 'BAT-B',
            nbNiveau: 1,
            srcFic: 'ETAT',
            agenceC: 'MINISTERE_EDUCATION',
            dispositifAc: 'EXTINCTEUR',
            salles: {
              create: [
                {
                  sigleSalle: 'CLASSE-03',
                  niveauSalle: 0,
                  affectationSalle: 'CLASSE',
                  etatSalle: 'MAUVAIS',
                  estOperationnel: false,
                  estElectrifiee: false,
                  longueurInt: 7.0,
                  hauteurSP: 3.0,
                  nbEleveF: 0,
                  nbEleveG: 0,
                },
              ],
            },
            toilettes: {
              create: [
                { nbCompartiment: 2, fonctionToilette: 'LATRINES', pointEau: false },
              ],
            },
          },
        ],
      },
    },
  });

  // Établissement 2: Collège d'Enseignement Général (CEG) d'Anosizato
  const ecole2 = await prisma.etablissement.create({
    data: {
      nomEtab: 'CEG Anosizato',
      dren: 'DREN Analamanga',
      cisco: 'CISCO Antananarivo-Renivohitra',
      commune: 'Anosizato',
      fokontany: 'Anosizato Ouest',
      quartier: 'Quartier Industriel',
      couvTelephonique: true,
      couvInternet: false,
      nbEnseignantG: 18,
      nbEnseignantF: 15,
      nbSectionG: 10,
      nbSectionF: 12,

      directeur: {
        create: {
          nomDirecteur: 'Razafimandimby',
          prenomDr: 'Pauline',
          emailDr: 'directeur.ceganosizato@education.mg',
          telDr: '+261 33 98 765 43',
        },
      },

      designations: {
        create: [
          {
            nomDesign: 'Terrain Principal',
            estEnceinteEtab: true,
            estTitre: false,
            typeDesignation: 'ARRETE',
            superficieDesign: 5000.0,
            estLitigieux: true,
          },
        ],
      },

      structures: {
        create: [
          { typeStruc: 'MUR_CLOTURE', existenceStruc: true, materiauxStruc: 'BRIQUE', etatStruc: 'MAUVAIS' },
          { typeStruc: 'PORTAL', existenceStruc: true, materiauxStruc: 'BOIS', etatStruc: 'MAUVAIS' },
        ],
      },

      batiments: {
        create: [
          {
            sigleBat: 'PEDAGO-1',
            nbNiveau: 2,
            srcFic: 'BID',
            agenceC: 'BID',
            dispositifAc: 'EXTINCTEUR',
            salles: {
              create: [
                {
                  sigleSalle: 'S101',
                  niveauSalle: 1,
                  affectationSalle: 'CLASSE',
                  etatSalle: 'BON',
                  estOperationnel: true,
                  estElectrifiee: true,
                  longueurInt: 9.0,
                  hauteurSP: 3.5,
                  nbEleveF: 20,
                  nbEleveG: 22,
                  equipements: {
                    create: [
                      { nomEquip: 'Table-banc', typeEquip: 'MOBILIER', etat: 'BON', quantite: 25 },
                      { nomEquip: 'Tableau blanc', typeEquip: 'MATERIEL_DIDACTIQUE', etat: 'BON', quantite: 1 },
                    ],
                  },
                },
                {
                  sigleSalle: 'S102',
                  niveauSalle: 1,
                  affectationSalle: 'CLASSE',
                  etatSalle: 'BON',
                  estOperationnel: true,
                  estElectrifiee: true,
                  longueurInt: 9.0,
                  hauteurSP: 3.5,
                  nbEleveF: 18,
                  nbEleveG: 20,
                },
                {
                  sigleSalle: 'LABO-SCIENCES',
                  niveauSalle: 2,
                  affectationSalle: 'LABORATOIRE',
                  etatSalle: 'MOYEN',
                  estOperationnel: true,
                  estElectrifiee: true,
                  longueurInt: 10.0,
                  hauteurSP: 4.0,
                  equipements: {
                    create: [
                      { nomEquip: 'Paillasse', typeEquip: 'MOBILIER', etat: 'MOYEN', quantite: 8 },
                      { nomEquip: 'Microscope', typeEquip: 'MATERIEL_SCIENTIFIQUE', etat: 'BON', quantite: 5 },
                      { nomEquip: 'Balance', typeEquip: 'MATERIEL_SCIENTIFIQUE', etat: 'MOYEN', quantite: 3 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Établissement 3: École Primaire d'Ambohibary - DREN Itasy
  const ecole3 = await prisma.etablissement.create({
    data: {
      nomEtab: 'École Primaire Publique d\'Ambohibary',
      dren: 'DREN Itasy',
      cisco: 'CISCO Arivonimamo',
      commune: 'Ambohibary',
      fokontany: 'Ambohibary Est',
      quartier: 'Centre',
      couvTelephonique: true,
      couvInternet: false,
      nbEnseignantG: 4,
      nbEnseignantF: 6,
      nbSectionG: 3,
      nbSectionF: 4,

      directeur: {
        create: {
          nomDirecteur: 'Rajaonarison',
          prenomDr: 'Faly',
          emailDr: 'directeur.ambohibary@education.mg',
          telDr: '+261 32 56 78 90',
        },
      },

      designations: {
        create: [
          {
            nomDesign: 'Terrain scolaire',
            estEnceinteEtab: false,
            estTitre: false,
            typeDesignation: 'OCCUPATION',
            superficieDesign: 1500.0,
            estLitigieux: false,
          },
        ],
      },

      batiments: {
        create: [
          {
            sigleBat: 'BAT-UNIQ',
            nbNiveau: 1,
            anneeRecProvC: new Date('2015-01-01'),
            anneeDefC: new Date('2016-12-01'),
            salles: {
              create: [
                {
                  sigleSalle: 'CP1',
                  niveauSalle: 0,
                  affectationSalle: 'CLASSE',
                  etatSalle: 'MOYEN',
                  estOperationnel: true,
                  estElectrifiee: true,
                  nbEleveF: 12,
                  nbEleveG: 10,
                  equipements: {
                    create: [
                      { nomEquip: 'Table-banc', typeEquip: 'MOBILIER', etat: 'MOYEN', quantite: 12 },
                      { nomEquip: 'Tableau noir', typeEquip: 'MATERIEL_DIDACTIQUE', etat: 'MAUVAIS', quantite: 1 },
                    ],
                  },
                },
                {
                  sigleSalle: 'CE1',
                  niveauSalle: 0,
                  affectationSalle: 'CLASSE',
                  etatSalle: 'MOYEN',
                  estOperationnel: true,
                  estElectrifiee: false,
                  nbEleveF: 8,
                  nbEleveG: 10,
                },
              ],
            },
            toilettes: {
              create: [
                { nbCompartiment: 2, fonctionToilette: 'LATRINES', pointEau: false },
              ],
            },
          },
        ],
      },
    },
  });

  // 3. Création des trajets et moyens
  console.log('🚗 Création des trajets...');

  const trajet1 = await prisma.trajet.create({
    data: {
      nomTrajet: 'Antananarivo → Ambohimanarina',
      debutTrajet: new Date('2024-01-01'),
      finTrajet: new Date('2024-12-31'),
      moyens: {
        create: { typeMoyen: 'TAXI-BROUSSE', dureeMoyen: 45, distanceMoyen: 12.5 },
      },
    },
  });

  const trajet2 = await prisma.trajet.create({
    data: {
      nomTrajet: 'Antananarivo → Anosizato',
      debutTrajet: new Date('2024-01-01'),
      finTrajet: new Date('2024-12-31'),
      moyens: {
        create: { typeMoyen: 'BUS', dureeMoyen: 30, distanceMoyen: 5.0 },
      },
    },
  });

  const trajet3 = await prisma.trajet.create({
    data: {
      nomTrajet: 'Arivonimamo → Ambohibary',
      debutTrajet: new Date('2024-01-01'),
      finTrajet: new Date('2024-12-31'),
      moyens: {
        create: { typeMoyen: 'PIED', dureeMoyen: 90, distanceMoyen: 6.0 },
      },
      periode: {
        create: { debutPeriode: new Date('2024-01-15'), finPeriode: new Date('2024-03-15') },
      },
    },
  });

  // 4. Création des aléas
  console.log('🌧️ Création des aléas...');

  const alea1 = await prisma.alea.create({
    data: {
      typeAleat: 'INONDATION',
      nomAleat: 'Inondation Ambohimanarina',
      dateAleat: new Date('2024-02-15'),
      explication: 'Fortes pluies ayant provoqué l\'inondation de l\'école pendant 3 jours',
      effets: {
        create: [
          { trajetId: trajet1.idTrajet, nbElevesG: 17, nbElevesF: 15, nbEnseignG: 2, nbEnseignF: 1 },
        ],
      },
    },
  });

  const alea2 = await prisma.alea.create({
    data: {
      typeAleat: 'VENT',
      nomAleat: 'Cyclone Ambohibary',
      dateAleat: new Date('2024-03-10'),
      explication: 'Toiture partiellement endommagée par le cyclone',
      effets: {
        create: [
          { trajetId: trajet3.idTrajet, nbElevesG: 10, nbElevesF: 8, nbEnseignG: 2, nbEnseignF: 1 },
        ],
      },
    },
  });

  const alea3 = await prisma.alea.create({
    data: {
      typeAleat: 'GLOISSEMENT_TERRAIN',
      nomAleat: 'Glissement terrain Anosizato',
      dateAleat: new Date('2024-01-20'),
      explication: 'Glissement de terrain ayant endommagé le mur de clôture',
      effets: {
        create: [
          { trajetId: trajet2.idTrajet, nbElevesG: 20, nbElevesF: 18, nbEnseignG: 3, nbEnseignF: 2 },
        ],
      },
    },
  });

  // 5. Création des logs initiaux
  console.log('📝 Création des logs...');

  await prisma.log.create({
    data: {
      action: 'CREATE', entity: 'SEED', details: 'Initialisation de la base de données via seed',
    },
  });

  console.log('\n✅ Seed terminé avec succès !');
  console.log(`   📊 Résumé :`);
  console.log(`   - ${3} établissements créés`);
  console.log(`   - ${2} utilisateurs créés`);
  console.log(`   - ${3} trajets créés`);
  console.log(`   - ${3} aléas créés`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
