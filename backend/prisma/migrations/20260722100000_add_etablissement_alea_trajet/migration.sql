-- Migration: Add EtablissementAlea and EtablissementTrajet pivot tables

-- Table de liaison: Établissement ↔ Aléa (many-to-many)
CREATE TABLE IF NOT EXISTS etablissement_alea (
  etablissement_id INTEGER NOT NULL REFERENCES etablissement(id_etab) ON DELETE CASCADE,
  alea_id INTEGER NOT NULL REFERENCES alea(id_aleat) ON DELETE CASCADE,
  PRIMARY KEY (etablissement_id, alea_id)
);

-- Table de liaison: Établissement ↔ Trajet (many-to-many)
CREATE TABLE IF NOT EXISTS etablissement_trajet (
  etablissement_id INTEGER NOT NULL REFERENCES etablissement(id_etab) ON DELETE CASCADE,
  trajet_id INTEGER NOT NULL REFERENCES trajet(id_trajet) ON DELETE CASCADE,
  PRIMARY KEY (etablissement_id, trajet_id)
);
