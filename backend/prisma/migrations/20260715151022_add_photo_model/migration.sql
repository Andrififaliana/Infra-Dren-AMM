-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'RESPONSABLE_INFRASTRUCTURE');

-- CreateTable
CREATE TABLE "etablissement" (
    "id_etab" SERIAL NOT NULL,
    "nom_etab" TEXT NOT NULL,
    "dren" TEXT,
    "cisco" TEXT,
    "commune" TEXT,
    "fokontany" TEXT,
    "quartier" TEXT,
    "couv_telephonique" BOOLEAN NOT NULL DEFAULT false,
    "couv_internet" BOOLEAN NOT NULL DEFAULT false,
    "nb_enseignant_g" INTEGER NOT NULL DEFAULT 0,
    "nb_enseignant_f" INTEGER NOT NULL DEFAULT 0,
    "nb_section_g" INTEGER NOT NULL DEFAULT 0,
    "nb_section_f" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "etablissement_pkey" PRIMARY KEY ("id_etab")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "original_name" TEXT,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "est_principale" BOOLEAN NOT NULL DEFAULT false,
    "etablissement_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "directeur" (
    "id_directeur" SERIAL NOT NULL,
    "nom_directeur" TEXT NOT NULL,
    "prenom_dr" TEXT,
    "email_dr" TEXT,
    "tel_dr" TEXT,
    "etablissement_id" INTEGER,

    CONSTRAINT "directeur_pkey" PRIMARY KEY ("id_directeur")
);

-- CreateTable
CREATE TABLE "designation" (
    "id_design" SERIAL NOT NULL,
    "nom_design" TEXT NOT NULL,
    "est_enceinte_etab" BOOLEAN NOT NULL DEFAULT false,
    "est_titre" BOOLEAN NOT NULL DEFAULT false,
    "type_designation" TEXT,
    "num_cadastre" TEXT,
    "superficie_design" DOUBLE PRECISION,
    "est_litigieux" BOOLEAN NOT NULL DEFAULT false,
    "etablissement_id" INTEGER NOT NULL,

    CONSTRAINT "designation_pkey" PRIMARY KEY ("id_design")
);

-- CreateTable
CREATE TABLE "structure" (
    "id_struc" SERIAL NOT NULL,
    "type_struc" TEXT,
    "existence_struc" BOOLEAN NOT NULL DEFAULT false,
    "materiaux_struc" TEXT,
    "etat_struc" TEXT,
    "etablissement_id" INTEGER NOT NULL,

    CONSTRAINT "structure_pkey" PRIMARY KEY ("id_struc")
);

-- CreateTable
CREATE TABLE "batiment" (
    "id_bat" SERIAL NOT NULL,
    "sigle_bat" TEXT,
    "nb_niveau" INTEGER NOT NULL DEFAULT 0,
    "annee_rec_prov_c" TIMESTAMP(3),
    "annee_def_c" TIMESTAMP(3),
    "src_fic" TEXT,
    "agence_c" TEXT,
    "annee_r" TIMESTAMP(3),
    "src_fir" TEXT,
    "agence_r" TEXT,
    "dispositif_ac" TEXT,
    "etablissement_id" INTEGER NOT NULL,

    CONSTRAINT "batiment_pkey" PRIMARY KEY ("id_bat")
);

-- CreateTable
CREATE TABLE "salle" (
    "id_salle" SERIAL NOT NULL,
    "sigle_salle" TEXT,
    "niveau_salle" INTEGER NOT NULL,
    "affectation_salle" TEXT,
    "etat_salle" TEXT,
    "est_operationnel" BOOLEAN NOT NULL DEFAULT true,
    "est_electrifiee" BOOLEAN NOT NULL DEFAULT false,
    "longueur_int" DOUBLE PRECISION,
    "hauteur_sp" DOUBLE PRECISION,
    "nb_eleve_f" INTEGER NOT NULL DEFAULT 0,
    "nb_eleve_g" INTEGER NOT NULL DEFAULT 0,
    "batiment_id" INTEGER NOT NULL,

    CONSTRAINT "salle_pkey" PRIMARY KEY ("id_salle")
);

-- CreateTable
CREATE TABLE "ouverture" (
    "id_ouvert" SERIAL NOT NULL,
    "type_ouvert" TEXT,
    "nb_ouvert" INTEGER NOT NULL DEFAULT 0,
    "largeur_ouvert" DOUBLE PRECISION,
    "hauteur_ouvert" DOUBLE PRECISION,
    "surface_ouvert" DOUBLE PRECISION,
    "salle_id" INTEGER NOT NULL,

    CONSTRAINT "ouverture_pkey" PRIMARY KEY ("id_ouvert")
);

-- CreateTable
CREATE TABLE "toilette" (
    "id_toilette" SERIAL NOT NULL,
    "nb_compartiment" INTEGER NOT NULL DEFAULT 0,
    "fonction_toilette" TEXT,
    "point_eau" BOOLEAN NOT NULL DEFAULT false,
    "batiment_id" INTEGER NOT NULL,

    CONSTRAINT "toilette_pkey" PRIMARY KEY ("id_toilette")
);

-- CreateTable
CREATE TABLE "trajet" (
    "id_trajet" SERIAL NOT NULL,
    "debut_trajet" TIMESTAMP(3),
    "fin_trajet" TIMESTAMP(3),
    "nom_trajet" TEXT,
    "moyens_id" INTEGER NOT NULL,
    "periode_id" INTEGER,

    CONSTRAINT "trajet_pkey" PRIMARY KEY ("id_trajet")
);

-- CreateTable
CREATE TABLE "moyens" (
    "id_moyen" SERIAL NOT NULL,
    "type_moyen" TEXT,
    "duree_moyen" DOUBLE PRECISION,
    "distance_moyen" DOUBLE PRECISION,

    CONSTRAINT "moyens_pkey" PRIMARY KEY ("id_moyen")
);

-- CreateTable
CREATE TABLE "periode_difficile" (
    "id_periode" SERIAL NOT NULL,
    "debut_periode" TIMESTAMP(3) NOT NULL,
    "fin_periode" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periode_difficile_pkey" PRIMARY KEY ("id_periode")
);

-- CreateTable
CREATE TABLE "alea" (
    "id_aleat" SERIAL NOT NULL,
    "type_aleat" TEXT,
    "nom_aleat" TEXT,
    "date_aleat" TIMESTAMP(3),
    "explication" TEXT,

    CONSTRAINT "alea_pkey" PRIMARY KEY ("id_aleat")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'RESPONSABLE_INFRASTRUCTURE',
    "supabase_user_id" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipement" (
    "id" SERIAL NOT NULL,
    "nom_equip" TEXT NOT NULL,
    "type_equip" TEXT,
    "etat" TEXT,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "salle_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entite_id" INTEGER,
    "details" TEXT,
    "utilisateur_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "effet_aleat" (
    "alea_id" INTEGER NOT NULL,
    "trajet_id" INTEGER NOT NULL,
    "nb_eleves_g" INTEGER NOT NULL DEFAULT 0,
    "nb_eleves_f" INTEGER NOT NULL DEFAULT 0,
    "nb_enseign_g" INTEGER NOT NULL DEFAULT 0,
    "nb_enseign_f" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "effet_aleat_pkey" PRIMARY KEY ("alea_id","trajet_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "directeur_etablissement_id_key" ON "directeur"("etablissement_id");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_supabase_user_id_key" ON "utilisateur"("supabase_user_id");

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissement"("id_etab") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directeur" ADD CONSTRAINT "directeur_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissement"("id_etab") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designation" ADD CONSTRAINT "designation_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissement"("id_etab") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structure" ADD CONSTRAINT "structure_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissement"("id_etab") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batiment" ADD CONSTRAINT "batiment_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissement"("id_etab") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salle" ADD CONSTRAINT "salle_batiment_id_fkey" FOREIGN KEY ("batiment_id") REFERENCES "batiment"("id_bat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ouverture" ADD CONSTRAINT "ouverture_salle_id_fkey" FOREIGN KEY ("salle_id") REFERENCES "salle"("id_salle") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "toilette" ADD CONSTRAINT "toilette_batiment_id_fkey" FOREIGN KEY ("batiment_id") REFERENCES "batiment"("id_bat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trajet" ADD CONSTRAINT "trajet_moyens_id_fkey" FOREIGN KEY ("moyens_id") REFERENCES "moyens"("id_moyen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trajet" ADD CONSTRAINT "trajet_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "periode_difficile"("id_periode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipement" ADD CONSTRAINT "equipement_salle_id_fkey" FOREIGN KEY ("salle_id") REFERENCES "salle"("id_salle") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "effet_aleat" ADD CONSTRAINT "effet_aleat_alea_id_fkey" FOREIGN KEY ("alea_id") REFERENCES "alea"("id_aleat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "effet_aleat" ADD CONSTRAINT "effet_aleat_trajet_id_fkey" FOREIGN KEY ("trajet_id") REFERENCES "trajet"("id_trajet") ON DELETE RESTRICT ON UPDATE CASCADE;
