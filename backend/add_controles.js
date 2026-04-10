/**
 * add_controles.js — Ajoute 23 contrôles ISO 27002 supplémentaires
 * Commande : node add_controles.js
 * Résultat : 35 contrôles au total (12 existants + 23 nouveaux)
 */
const db = require('./db');

const nouveaux = [
  // ── Organisationnel (+10) ─────────────────────────────────────
  ['5.3',  'Séparation des tâches',               'Organisationnel', "Séparer les tâches conflictuelles pour réduire les risques de modification non autorisée des actifs."],
  ['5.4',  'Responsabilités de la direction',      'Organisationnel', "La direction doit exiger de tout le personnel qu'il applique la sécurité de l'information conformément aux politiques établies."],
  ['5.5',  'Contact avec les autorités',           'Organisationnel', "Établir et maintenir des contacts avec les autorités compétentes en matière de sécurité de l'information."],
  ['5.10', "Utilisation acceptable des actifs",    'Organisationnel', "Définir et documenter les règles d'utilisation acceptable des actifs informationnels et des moyens de traitement."],
  ['5.12', "Classification de l'information",      'Organisationnel', "Classifier l'information selon les exigences légales, la valeur, la criticité et la sensibilité aux divulgations non autorisées."],
  ['5.14', "Transfert de l'information",           'Organisationnel', "Établir des règles, procédures ou accords de transfert de l'information pour tous les types de transfert."],
  ['5.16', "Gestion des identités",                'Organisationnel', "Gérer le cycle de vie complet des identités numériques, de la création à la suppression."],
  ['5.17', "Informations d'authentification",      'Organisationnel', "Contrôler l'attribution et la gestion des informations d'authentification par un processus formel."],
  ['5.23', "Sécurité des services cloud",          'Organisationnel', "Établir des processus d'acquisition, d'utilisation, de gestion et de sortie des services cloud conformes aux exigences de sécurité."],
  ['5.29', "Sécurité en cas de perturbation",      'Organisationnel', "Planifier la manière dont l'organisation maintient la sécurité de l'information lors d'une perturbation."],
  // ── Humain (+3) ───────────────────────────────────────────────
  ['6.1',  'Sélection du personnel',               'Humain',          "Effectuer des vérifications des antécédents de tous les candidats avant leur embauche, conformément aux lois applicables."],
  ['6.2',  "Conditions d'emploi",                  'Humain',          "Les accords contractuels avec les employés et sous-traitants doivent énoncer leurs responsabilités en matière de sécurité."],
  ['6.4',  'Processus disciplinaire',              'Humain',          "Formaliser et communiquer un processus disciplinaire pour prendre des mesures en cas de violation de la sécurité."],
  // ── Physique (+5) ─────────────────────────────────────────────
  ['7.2',  'Sécurité des bureaux et des salles',   'Physique',        "Concevoir et appliquer une sécurité physique pour les bureaux, les salles et les installations de l'organisation."],
  ['7.4',  'Surveillance de la sécurité physique', 'Physique',        "Surveiller en permanence les locaux pour détecter les accès physiques non autorisés."],
  ['7.6',  'Travail dans les zones sécurisées',    'Physique',        "Concevoir et mettre en œuvre des mesures de sécurité pour le travail dans les zones sécurisées."],
  ['7.8',  'Emplacement et protection des équipements', 'Physique',   "Placer les équipements de manière sécurisée et les protéger contre les menaces environnementales et les accès non autorisés."],
  ['7.10', 'Supports de stockage',                 'Physique',        "Gérer les supports de stockage tout au long de leur cycle de vie : acquisition, utilisation, transport et mise au rebut."],
  // ── Technologique (+5) ────────────────────────────────────────
  ['8.1',  'Terminaux utilisateurs',               'Technologique',   "Protéger les informations stockées, traitées ou accessibles via les terminaux utilisateurs."],
  ['8.2',  "Droits d'accès privilégiés",           'Technologique',   "Restreindre et gérer l'attribution et l'utilisation des droits d'accès privilégiés."],
  ['8.8',  'Gestion des vulnérabilités techniques','Technologique',   "Obtenir des informations sur les vulnérabilités techniques, évaluer l'exposition et prendre des mesures appropriées."],
  ['8.9',  'Gestion de la configuration',          'Technologique',   "Établir, documenter, mettre en œuvre et surveiller les configurations de sécurité du matériel, logiciels et réseaux."],
  ['8.20', 'Sécurité des réseaux',                 'Technologique',   "Sécuriser, gérer et contrôler les réseaux et les équipements réseau pour protéger les informations."],
];

async function run() {
  let added = 0;
  let skipped = 0;

  for (const [code, titre, theme, desc] of nouveaux) {
    const exists = await db.query('SELECT id FROM controles_iso WHERE code_iso=$1', [code]);
    if (!exists.rows.length) {
      await db.query(
        'INSERT INTO controles_iso (code_iso, titre, theme, description) VALUES ($1,$2,$3,$4)',
        [code, titre, theme, desc]
      );
      added++;
      console.log(`  ✓ Ajouté : ${code} — ${titre}`);
    } else {
      skipped++;
    }
  }

  const total = await db.query('SELECT COUNT(*) as n FROM controles_iso');
  const byTheme = await db.query('SELECT theme, COUNT(*) as n FROM controles_iso GROUP BY theme ORDER BY theme');

  console.log(`\n✓ ${added} contrôles ajoutés, ${skipped} déjà présents`);
  console.log(`✓ Total : ${total.rows[0].n} contrôles ISO 27002\n`);
  console.log('Répartition par thème :');
  byTheme.rows.forEach(r => console.log(`  ${r.theme.padEnd(20)} : ${r.n} contrôles`));

  process.exit(0);
}

run().catch(e => {
  console.error('Erreur :', e.message);
  process.exit(1);
});
