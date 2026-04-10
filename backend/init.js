/**
 * init.js — À lancer UNE SEULE FOIS pour créer les tables et insérer les contrôles ISO.
 * Commande : node init.js
 */
const pool = require('./db');

async function init() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id             SERIAL PRIMARY KEY,
        nom            TEXT NOT NULL,
        email          TEXT NOT NULL UNIQUE,
        password_hash  TEXT NOT NULL,
        date_creation  DATE DEFAULT CURRENT_DATE
      );

      CREATE TABLE IF NOT EXISTS missions (
        id             SERIAL PRIMARY KEY,
        titre          TEXT NOT NULL,
        date_creation  DATE DEFAULT CURRENT_DATE,
        statut         TEXT DEFAULT 'en_cours',
        auditeur       TEXT,
        client         TEXT
      );

      CREATE TABLE IF NOT EXISTS lettres_mission (
        id             SERIAL PRIMARY KEY,
        mission_id     INTEGER NOT NULL UNIQUE REFERENCES missions(id) ON DELETE CASCADE,
        fichier_path   TEXT,
        notes          TEXT
      );

      CREATE TABLE IF NOT EXISTS fiches_entreprise (
        id                  SERIAL PRIMARY KEY,
        mission_id          INTEGER NOT NULL UNIQUE REFERENCES missions(id) ON DELETE CASCADE,
        nom                 TEXT,
        secteur             TEXT,
        effectif            INTEGER,
        ca                  TEXT,
        siege               TEXT,
        activite            TEXT,
        clients_principaux  TEXT,
        interlocuteurs      TEXT
      );

      CREATE TABLE IF NOT EXISTS architectures (
        id             SERIAL PRIMARY KEY,
        mission_id     INTEGER NOT NULL UNIQUE REFERENCES missions(id) ON DELETE CASCADE,
        fichier_path   TEXT,
        notes          TEXT
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id             SERIAL PRIMARY KEY,
        mission_id     INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
        titre          TEXT NOT NULL,
        date_incident  DATE,
        gravite        TEXT CHECK(gravite IN ('critique','eleve','moyen','faible')),
        description    TEXT
      );

      CREATE TABLE IF NOT EXISTS controles_iso (
        id          SERIAL PRIMARY KEY,
        code_iso    TEXT NOT NULL,
        titre       TEXT NOT NULL,
        theme       TEXT CHECK(theme IN ('Organisationnel','Humain','Physique','Technologique')),
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS perimetres (
        id           SERIAL PRIMARY KEY,
        mission_id   INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
        controle_id  INTEGER NOT NULL REFERENCES controles_iso(id) ON DELETE CASCADE,
        UNIQUE(mission_id, controle_id)
      );

      CREATE TABLE IF NOT EXISTS evaluations (
        id              SERIAL PRIMARY KEY,
        mission_id      INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
        controle_id     INTEGER NOT NULL REFERENCES controles_iso(id) ON DELETE CASCADE,
        statut          TEXT DEFAULT 'non_evalue' CHECK(statut IN ('conforme','non_conforme','partiel','non_evalue')),
        maturite        INTEGER CHECK(maturite BETWEEN 0 AND 5),
        justification   TEXT,
        risque          TEXT CHECK(risque IN ('critique','eleve','moyen','faible')),
        recommandation  TEXT,
        UNIQUE(mission_id, controle_id)
      );

      CREATE TABLE IF NOT EXISTS preuves (
        id              SERIAL PRIMARY KEY,
        evaluation_id   INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
        nom_fichier     TEXT,
        fichier_path    TEXT,
        type_fichier    TEXT,
        date_upload     DATE DEFAULT CURRENT_DATE
      );

      CREATE TABLE IF NOT EXISTS rapport (
        id                    SERIAL PRIMARY KEY,
        mission_id            INTEGER NOT NULL UNIQUE REFERENCES missions(id) ON DELETE CASCADE,
        score_global          NUMERIC(5,2),
        nb_conformes          INTEGER DEFAULT 0,
        nb_non_conformes      INTEGER DEFAULT 0,
        nb_partiels           INTEGER DEFAULT 0,
        recommandation_finale TEXT,
        date_generation       DATE DEFAULT CURRENT_DATE
      );
    `);

    // Seed contrôles ISO 27002 si vide
    const { rows } = await client.query('SELECT COUNT(*) AS n FROM controles_iso');
    if (parseInt(rows[0].n) === 0) {
      const controles = [
        // ── Organisationnel (14) ──────────────────────────────────────────
        ['5.1',  'Politique de sécurité',                          'Organisationnel', "Définir et approuver une politique de sécurité de l'information."],
        ['5.2',  'Rôles et responsabilités',                       'Organisationnel', "Attribuer les responsabilités liées à la sécurité de l'information."],
        ['5.3',  'Séparation des tâches',                          'Organisationnel', "Séparer les tâches conflictuelles pour réduire les risques de modification non autorisée."],
        ['5.4',  'Responsabilités de la direction',                'Organisationnel', "La direction doit exiger de tout le personnel qu'il applique la sécurité de l'information."],
        ['5.5',  'Contact avec les autorités',                     'Organisationnel', "Établir et maintenir des contacts avec les autorités compétentes en sécurité."],
        ['5.9',  'Inventaire des actifs',                          'Organisationnel', "Identifier et gérer les actifs informationnels."],
        ['5.10', "Utilisation acceptable des actifs",              'Organisationnel', "Définir et documenter les règles d'utilisation acceptable des actifs informationnels."],
        ['5.12', "Classification de l'information",                'Organisationnel', "Classifier l'information selon sa valeur, criticité et sensibilité."],
        ['5.14', "Transfert de l'information",                     'Organisationnel', "Établir des règles et procédures pour tous les types de transfert d'information."],
        ['5.15', "Contrôle d'accès",                               'Organisationnel', "Restreindre l'accès aux informations selon le besoin d'en connaître."],
        ['5.16', "Gestion des identités",                          'Organisationnel', "Gérer le cycle de vie complet des identités numériques."],
        ['5.17', "Informations d'authentification",                'Organisationnel', "Contrôler l'attribution et la gestion des informations d'authentification."],
        ['5.23', "Sécurité des services cloud",                    'Organisationnel', "Établir des processus de gestion sécurisée des services cloud."],
        ['5.29', "Sécurité en cas de perturbation",                'Organisationnel', "Maintenir la sécurité de l'information lors d'une perturbation."],
        // ── Humain (5) ────────────────────────────────────────────────────
        ['6.1',  'Sélection du personnel',                         'Humain',          "Effectuer des vérifications des antécédents avant l'embauche."],
        ['6.2',  "Conditions d'emploi",                            'Humain',          "Les accords contractuels doivent énoncer les responsabilités sécurité."],
        ['6.3',  'Sensibilisation et formation',                   'Humain',          "Former et sensibiliser le personnel à la sécurité de l'information."],
        ['6.4',  'Processus disciplinaire',                        'Humain',          "Formaliser un processus disciplinaire pour les violations de sécurité."],
        ['6.5',  'Gestion des départs',                            'Humain',          "Gérer la sécurité lors des départs ou changements de poste."],
        // ── Physique (6) ──────────────────────────────────────────────────
        ['7.1',  'Sécurité physique des locaux',                   'Physique',        "Protéger les zones sensibles contre les accès non autorisés."],
        ['7.2',  'Sécurité des bureaux et des salles',             'Physique',        "Concevoir et appliquer une sécurité physique pour les bureaux et salles."],
        ['7.4',  'Surveillance de la sécurité physique',           'Physique',        "Surveiller en permanence les locaux pour détecter les accès non autorisés."],
        ['7.6',  'Travail dans les zones sécurisées',              'Physique',        "Mettre en œuvre des mesures de sécurité pour le travail en zones sécurisées."],
        ['7.8',  'Emplacement et protection des équipements',      'Physique',        "Placer et protéger les équipements contre les menaces environnementales."],
        ['7.10', 'Supports de stockage',                           'Physique',        "Gérer les supports de stockage tout au long de leur cycle de vie."],
        // ── Technologique (10) ────────────────────────────────────────────
        ['8.1',  'Terminaux utilisateurs',                         'Technologique',   "Protéger les informations stockées et accessibles via les terminaux."],
        ['8.2',  "Droits d'accès privilégiés",                     'Technologique',   "Restreindre et gérer l'attribution des droits d'accès privilégiés."],
        ['8.5',  'Authentification sécurisée',                     'Technologique',   "Mettre en œuvre des mécanismes d'authentification robustes."],
        ['8.7',  'Protection contre les malwares',                 'Technologique',   "Déployer des protections contre les logiciels malveillants."],
        ['8.8',  'Gestion des vulnérabilités techniques',          'Technologique',   "Identifier et traiter les vulnérabilités techniques des systèmes."],
        ['8.9',  'Gestion de la configuration',                    'Technologique',   "Établir et maintenir les configurations de sécurité des systèmes."],
        ['8.12', 'Prévention des fuites de données',               'Technologique',   "Contrôler et prévenir les transferts non autorisés d'informations."],
        ['8.15', 'Journalisation',                                  'Technologique',   "Enregistrer les événements système pour la détection et l'investigation."],
        ['8.20', 'Sécurité des réseaux',                           'Technologique',   "Sécuriser, gérer et contrôler les réseaux et équipements réseau."],
        ['8.24', 'Cryptographie',                                  'Technologique',   "Utiliser la cryptographie pour protéger les informations sensibles."],
      ];
      for (const [code, titre, theme, desc] of controles) {
        await client.query(
          'INSERT INTO controles_iso (code_iso, titre, theme, description) VALUES ($1,$2,$3,$4)',
          [code, titre, theme, desc]
        );
      }
      console.log('✓ 35 contrôles ISO 27002 insérés');
    } else {
      console.log('✓ Contrôles déjà présents');
    }

    // Seed utilisateur démo si vide
    const { rows: userRows } = await client.query('SELECT COUNT(*) AS n FROM users');
    if (parseInt(userRows[0].n) === 0) {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update('audit1234').digest('hex');
      await client.query(
        'INSERT INTO users (nom, email, password_hash) VALUES ($1,$2,$3)',
        ['Jean Dupont', 'jean@audit.com', hash]
      );
      console.log('✓ Utilisateur démo créé : jean@audit.com / audit1234');
    }

    await client.query('COMMIT');
    console.log('✓ Toutes les tables créées avec succès');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Erreur init:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
