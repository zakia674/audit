-- ============================================================
-- Ajout de 23 contrôles ISO 27002:2022 supplémentaires
-- Total après exécution : 35 contrôles (12 existants + 23 nouveaux)
-- Exécuter dans psql ou pgAdmin sur la base learn_audit
-- ============================================================

INSERT INTO controles_iso (code_iso, titre, theme, description) VALUES

-- ── ORGANISATIONNEL (14 contrôles au total) ──────────────────

('5.3',  'Séparation des tâches',
 'Organisationnel',
 'Les tâches et domaines de responsabilité conflictuels doivent être séparés pour réduire les risques de modification non autorisée ou involontaire des actifs.'),

('5.4',  'Responsabilités de la direction',
 'Organisationnel',
 'La direction doit exiger de tout le personnel qu''il applique la sécurité de l''information conformément à la politique et aux procédures établies.'),

('5.5',  'Contact avec les autorités',
 'Organisationnel',
 'L''organisation doit établir et maintenir des contacts avec les autorités compétentes en matière de sécurité de l''information.'),

('5.10', 'Utilisation acceptable des actifs',
 'Organisationnel',
 'Des règles d''utilisation acceptable et des procédures de traitement des actifs informationnels doivent être identifiées, documentées et mises en œuvre.'),

('5.12', 'Classification de l''information',
 'Organisationnel',
 'L''information doit être classifiée selon les exigences légales, la valeur, la criticité et la sensibilité aux divulgations ou modifications non autorisées.'),

('5.14', 'Transfert de l''information',
 'Organisationnel',
 'Des règles, procédures ou accords de transfert de l''information doivent être en place pour tous les types de transfert au sein et en dehors de l''organisation.'),

('5.16', 'Gestion des identités',
 'Organisationnel',
 'Le cycle de vie complet des identités doit être géré, de la création à la suppression, en passant par la modification des droits d''accès.'),

('5.17', 'Informations d''authentification',
 'Organisationnel',
 'L''attribution et la gestion des informations d''authentification doivent être contrôlées par un processus de gestion formel.'),

('5.23', 'Sécurité de l''information pour les services cloud',
 'Organisationnel',
 'Les processus d''acquisition, d''utilisation, de gestion et de sortie des services cloud doivent être établis conformément aux exigences de sécurité.'),

('5.29', 'Sécurité de l''information en cas de perturbation',
 'Organisationnel',
 'L''organisation doit planifier la manière dont elle maintient la sécurité de l''information à un niveau approprié lors d''une perturbation.'),

('5.30', 'Préparation aux TIC pour la continuité d''activité',
 'Organisationnel',
 'La préparation des TIC doit être planifiée, mise en œuvre, maintenue et testée sur la base des objectifs de continuité d''activité.'),

-- ── HUMAIN (5 contrôles au total) ────────────────────────────

('6.1',  'Sélection du personnel',
 'Humain',
 'Des vérifications des antécédents de tous les candidats doivent être effectuées avant leur embauche, conformément aux lois et réglementations applicables.'),

('6.2',  'Conditions d''emploi',
 'Humain',
 'Les accords contractuels avec les employés et les sous-traitants doivent énoncer leurs responsabilités et celles de l''organisation en matière de sécurité.'),

('6.4',  'Processus disciplinaire',
 'Humain',
 'Un processus disciplinaire doit être formalisé et communiqué pour prendre des mesures à l''encontre des employés ayant commis une violation de la sécurité.'),

-- ── PHYSIQUE (6 contrôles au total) ──────────────────────────

('7.2',  'Sécurité des bureaux et des salles',
 'Physique',
 'Une sécurité physique doit être conçue et appliquée pour les bureaux, les salles et les installations de l''organisation.'),

('7.4',  'Surveillance de la sécurité physique',
 'Physique',
 'Les locaux doivent être surveillés en permanence pour détecter les accès physiques non autorisés.'),

('7.6',  'Travail dans les zones sécurisées',
 'Physique',
 'Des mesures de sécurité pour le travail dans les zones sécurisées doivent être conçues et mises en œuvre.'),

('7.8',  'Emplacement et protection des équipements',
 'Physique',
 'Les équipements doivent être placés de manière sécurisée et protégés contre les menaces environnementales et les accès non autorisés.'),

('7.10', 'Supports de stockage',
 'Physique',
 'Les supports de stockage doivent être gérés tout au long de leur cycle de vie : acquisition, utilisation, transport et mise au rebut.'),

-- ── TECHNOLOGIQUE (10 contrôles au total) ────────────────────

('8.1',  'Terminaux utilisateurs',
 'Technologique',
 'Les informations stockées sur les terminaux utilisateurs, traitées ou accessibles via ceux-ci, doivent être protégées.'),

('8.2',  'Droits d''accès privilégiés',
 'Technologique',
 'L''attribution et l''utilisation des droits d''accès privilégiés doivent être restreintes et gérées.'),

('8.8',  'Gestion des vulnérabilités techniques',
 'Technologique',
 'Les informations sur les vulnérabilités techniques des systèmes utilisés doivent être obtenues, l''exposition de l''organisation à ces vulnérabilités évaluée et des mesures appropriées prises.'),

('8.9',  'Gestion de la configuration',
 'Technologique',
 'Les configurations, y compris les configurations de sécurité, du matériel, des logiciels, des services et des réseaux doivent être établies, documentées, mises en œuvre, surveillées et révisées.'),

('8.16', 'Activités de surveillance',
 'Technologique',
 'Les réseaux, les systèmes et les applications doivent être surveillés pour détecter les comportements anormaux et des mesures appropriées doivent être prises.'),

('8.20', 'Sécurité des réseaux',
 'Technologique',
 'Les réseaux et les équipements réseau doivent être sécurisés, gérés et contrôlés pour protéger les informations dans les systèmes et les applications.'),

('8.21', 'Sécurité des services réseau',
 'Technologique',
 'Les mécanismes de sécurité, les niveaux de service et les exigences de service pour tous les services réseau doivent être identifiés, mis en œuvre et surveillés.'),

('8.28', 'Codage sécurisé',
 'Technologique',
 'Des principes de codage sécurisé doivent être appliqués au développement de logiciels.')

ON CONFLICT DO NOTHING;

-- Vérification du résultat
SELECT theme, COUNT(*) as nb_controles
FROM controles_iso
GROUP BY theme
ORDER BY theme;
