export const controls = [
  {
    id: "5.1",
    theme: "Organisationnel",
    title: "Politique de sécurité",
    description:
      "Des politiques de sécurité de l'information, approuvées par la direction, doivent être définies, publiées et communiquées à tout le personnel.",
    objective:
      "S'assurer que la direction définit une orientation claire en matière de sécurité, que cette politique est approuvée au plus haut niveau et diffusée à l'ensemble du personnel, y compris les nouveaux arrivants.",
    question: "La politique de sécurité est-elle définie, approuvée, et communiquée à TOUS les employés ?",
    interview: {
      interlocutor: "Youssef Alami — DSI (en l'absence de RSSI)",
      exchanges: [
        { q: "Avez-vous une politique de sécurité de l'information formalisée ?", a: "Oui, on a un document qui a été fait en 2021 je crois. C'est Karim qui l'avait signé à l'époque." },
        { q: "Ce document a-t-il été révisé depuis sa création ?", a: "Honnêtement... pas que je sache. On a eu beaucoup de projets clients, ça n'a pas été prioritaire." },
        { q: "Comment avez-vous communiqué cette politique à vos 35 employés ?", a: "On l'a envoyée aux managers par email. Ils étaient censés la transmettre à leurs équipes." },
        { q: "Avez-vous des accusés de réception ou des preuves de lecture ?", a: "Non, pas vraiment. C'était plus informel. Vous pensez que c'est un problème ?" },
        { q: "Les 14 employés recrutés depuis 2021 ont-ils reçu ce document ?", a: "... Je ne suis pas sûr. Je vais vérifier avec Nadia." },
      ],
      auditorNote: "Le DSI confirme l'existence d'une politique mais ne peut pas prouver sa diffusion. Aucun processus de mise à jour ni de communication systématique.",
    },
    evidences: [
      {
        id: "E-5.1-1",
        label: "Consulter la politique de sécurité",
        type: "document",
        content: `DATASAFE MAROC — POLITIQUE DE SÉCURITÉ SI
Référence : PSI-DM-2021-v1.0
Créée le  : 08 février 2021
Dernière révision : jamais
Signataire : Ancien DG M. Nabil Cherkaoui (parti en 2023)

DIFFUSION :
  Envoyée à          : 12 managers en février 2021
  Non envoyée à      : 23 consultants et techniciens
  Employés recrutés après 2021 : 14 — aucun n'a reçu le document
  Accusés de réception signés  : 0/35`,
      },
      {
        id: "E-5.1-2",
        label: "Vérifier les accusés de réception Microsoft 365",
        type: "log",
        content: `DATASAFE MAROC — AUDIT DIFFUSION POLITIQUE
Source : Microsoft 365 — Exchange Online
Date   : 24 mars 2025

RECHERCHE EMAIL "politique sécurité" :
  Email envoyé le : 08/02/2021
  Destinataires   : 12 adresses managers
  Pièce jointe    : PSI-DM-2021-v1.0.pdf

EMPLOYÉS ACTUELS N'AYANT PAS REÇU LE DOCUMENT :
  Recrutés 2021-2025 : 14 employés
  Email de diffusion reçu : 0/14

AUCUN RENVOI DU DOCUMENT DEPUIS 2021
Dernière communication sécurité direction : introuvable
Révision documentée : AUCUNE`,
      },
    ],
    defaultRecommendation:
      "Réviser et mettre à jour la PSI. Organiser une session de sensibilisation obligatoire pour tous les 35 employés. Mettre en place un accusé de réception signé.",
  },
  {
    id: "5.2",
    theme: "Organisationnel",
    title: "Rôles et responsabilités",
    description:
      "Les rôles et responsabilités en matière de sécurité de l'information doivent être définis et attribués conformément aux besoins de l'organisation.",
    objective:
      "Garantir que chaque employé connaît ses responsabilités en matière de sécurité, qu'un RSSI est désigné, et que les droits d'accès sont attribués en cohérence avec les fonctions réelles.",
    question: "Les rôles et responsabilités en sécurité sont-ils formellement définis et attribués ?",
    interview: {
      interlocutor: "Youssef Alami — DSI",
      exchanges: [
        { q: "Qui est responsable de la sécurité de l'information chez DataSafe ?", a: "Techniquement c'est moi, en tant que DSI. Mais je gère aussi toute l'infrastructure, les projets clients... c'est beaucoup." },
        { q: "Avez-vous un RSSI désigné ?", a: "On avait Rachid Benali, mais il est parti en 2022. On n'a pas encore trouvé quelqu'un pour le remplacer." },
        { q: "Les responsabilités sécurité sont-elles mentionnées dans les fiches de poste ?", a: "Dans certaines, oui. Pas toutes. Les fiches ont été faites à des moments différents." },
        { q: "Qui a les droits d'administration sur Azure AD ?", a: "Plusieurs personnes de l'équipe technique. C'est plus pratique comme ça pour les urgences." },
        { q: "Combien exactement ?", a: "Je dirais... 4 ou 5. Peut-être un peu plus." },
      ],
      auditorNote: "RSSI vacant depuis 3 ans. Le DSI cumule les rôles. Les droits admin sont distribués sans gouvernance formelle — l'audit Azure AD révèle 9 comptes Global Admin.",
    },
    evidences: [
      {
        id: "E-5.2-1",
        label: "Consulter les fiches de poste",
        type: "document",
        content: `DATASAFE MAROC — SYNTHÈSE AUDIT 35 FICHES DE POSTE
Date : mars 2025

Poste analysé : Consultant Infrastructure Senior — Mehdi Lahlou
Embauché : 03/09/2019
Accès : Azure AD admin, serveurs Windows, données clients

ÉLÉMENTS ABSENTS :
  ✗ Aucune responsabilité sécurité SI mentionnée
  ✗ Aucune clause de confidentialité
  ✗ Aucune obligation de signalement d'incidents
  ✗ Aucune habilitation malgré accès données sensibles

SYNTHÈSE 35 FICHES :
  Responsabilités sécurité   : 3/35  (9%)
  Clause confidentialité     : 11/35 (31%)
  RSSI désigné               : 0/35  (0%)
  Obligation signalement     : 0/35  (0%)`,
      },
      {
        id: "E-5.2-2",
        label: "Vérifier la structure organisationnelle Azure AD",
        type: "config",
        content: `DATASAFE MAROC — ORGANIGRAMME SÉCURITÉ
Source : Azure AD — structure des rôles
Date   : 24 mars 2025

RÔLE RSSI DANS AZURE AD        : non créé
RÔLE "RESPONSABLE SÉCURITÉ"    : non attribué

ADMINISTRATEURS GLOBAUX (9 comptes) :
  k.idrissi@datasafe.ma    — Directeur Technique
  m.lahlou@datasafe.ma     — Consultant Senior
  y.fassi@datasafe.ma      — Chef de projet
  a.berrada@datasafe.ma    — Consultant Infrastructure
  + 5 autres consultants

CONSTAT : 9 personnes ont des droits admin globaux sans qu'aucune
ne soit formellement RSSI. Aucune séparation des rôles
sécurité / technique.`,
      },
    ],
    defaultRecommendation:
      "Nommer un RSSI et formaliser sa fiche de poste. Intégrer les responsabilités sécurité dans toutes les fiches de poste. Ajouter des clauses de confidentialité aux contrats.",
  },
  {
    id: "5.9",
    theme: "Organisationnel",
    title: "Inventaire des actifs",
    description:
      "Un inventaire des actifs associés à l'information et aux moyens de traitement de l'information doit être établi et tenu à jour.",
    objective:
      "Identifier et recenser tous les actifs informationnels (matériels, logiciels, données, services cloud) afin de leur attribuer un propriétaire, une classification et un niveau de protection adapté.",
    question: "L'inventaire des actifs est-il complet, à jour et correctement classifié ?",
    interview: {
      interlocutor: "Mehdi Lahlou — Administrateur Systèmes Senior",
      exchanges: [
        { q: "Disposez-vous d'un inventaire des actifs informatiques ?", a: "Oui, on a un fichier Excel. Youssef l'a créé en 2023." },
        { q: "Quand a-t-il été mis à jour pour la dernière fois ?", a: "Il y a... un moment. On a acheté des nouveaux laptops l'année dernière, je pense qu'ils ne sont pas encore dedans." },
        { q: "Les données clients sont-elles répertoriées comme actifs ?", a: "Les données ? Non, on a listé les équipements physiques et les logiciels. Les données... c'est dans SharePoint." },
        { q: "Chaque actif a-t-il un propriétaire désigné et une classification ?", a: "Un propriétaire pour les serveurs oui. Pour le reste... pas vraiment de classification formelle." },
        { q: "Savez-vous combien d'appareils sont connectés à votre Azure AD ?", a: "Sur le réseau local, une quarantaine je dirais. Dans Azure AD exactement, je n'ai pas vérifié récemment." },
      ],
      auditorNote: "L'inventaire existe mais est incomplet et non classifié. Les actifs cloud et les données clients — les plus sensibles — sont absents. Taux de complétude estimé à 35%.",
    },
    evidences: [
      {
        id: "E-5.9-1",
        label: "Consulter le registre des actifs",
        type: "document",
        content: `DATASAFE MAROC — INVENTAIRE ACTIFS INFORMATIQUES
Fichier : Inventaire_Actifs_DM_2023.xlsx
Dernière mise à jour : il y a 14 mois

ACTIFS RÉPERTORIÉS (18) :
  Postes de travail   × 12   Responsable : assigné
  Serveurs Windows    × 3    Responsable : M. Karim Idrissi
  Switches réseau     × 2    Responsable : non assigné
  Firewall            × 1    Responsable : non assigné

ACTIFS MANQUANTS :
  ✗ 6 laptops achetés en 2024
  ✗ Licences Microsoft 365 (35 comptes)
  ✗ Tenant Azure AD
  ✗ Données clients Ministère des Finances
  ✗ Données clients banques (3 contrats actifs)
  ✗ VPN d'accès distant (18 consultants)
  ✗ Serveur de sauvegarde externe

TAUX DE COMPLÉTUDE ESTIMÉ : 35%`,
      },
      {
        id: "E-5.9-2",
        label: "Scanner les actifs Azure AD non répertoriés",
        type: "config",
        content: `DATASAFE MAROC — SCAN ACTIFS AZURE AD
Date : 24 mars 2025

LICENCES MICROSOFT 365 ACTIVES :
  Comptes utilisateurs          : 35
  Comptes de service            : 8  (non dans l'inventaire)
  Applications tierces connectées : 14 (non inventoriées)

APPAREILS ENREGISTRÉS DANS AZURE AD : 41
  Dans l'inventaire papier : 23
  Non répertoriés          : 18 appareils

DONNÉES STOCKÉES SHAREPOINT :
  Sites clients actifs          : 6
  Volume données                : ~240 Go
  Classifiés dans inventaire    : 0

CONSTAT : 18 appareils et l'intégralité des données cloud sont
absents de l'inventaire officiel.`,
      },
    ],
    defaultRecommendation:
      "Mettre à jour l'inventaire et inclure tous les actifs 2024. Définir une classification (Public / Interne / Confidentiel / Secret). Désigner un propriétaire pour chaque actif.",
  },
  {
    id: "5.15",
    theme: "Organisationnel",
    title: "Contrôle d'accès",
    description:
      "Des règles de contrôle d'accès doivent être établies et mises en œuvre sur la base des exigences métier et de sécurité de l'information.",
    objective:
      "Limiter l'accès aux systèmes et aux données au strict nécessaire (principe du moindre privilège), révoquer les accès des personnes ayant quitté l'organisation, et revoir régulièrement les droits accordés.",
    question: "Le contrôle d'accès est-il basé sur le principe du moindre privilège et régulièrement revu ?",
    interview: {
      interlocutor: "Youssef Alami — DSI",
      exchanges: [
        { q: "Avez-vous une politique de contrôle d'accès documentée ?", a: "On a quelque chose, oui. Un document de 2020 je crois." },
        { q: "Appliquez-vous le principe du moindre privilège ?", a: "On essaie. Mais en pratique, quand un consultant a besoin d'accès pour un projet urgent, on lui donne ce qu'il faut." },
        { q: "Faites-vous des revues régulières des droits d'accès ?", a: "On devrait le faire tous les ans. Avec le départ du RSSI... ça n'a pas été fait." },
        { q: "Que se passe-t-il quand un employé quitte l'entreprise ?", a: "On désactive son compte. Enfin, normalement. RH nous prévient et on s'en occupe." },
        { q: "Pouvez-vous me montrer les comptes actuellement actifs dans Azure AD ?", a: "Oui, je peux vous faire un export. Donnez-moi quelques minutes." },
      ],
      auditorNote: "La revue des accès n'a jamais été réalisée. L'export Azure AD révèle 5 comptes d'ex-employés encore actifs, dont certains se sont connectés récemment.",
    },
    evidences: [
      {
        id: "E-5.15-1",
        label: "Auditer les comptes Azure AD",
        type: "log",
        content: `DATASAFE MAROC — AUDIT COMPTES AZURE AD
Export effectué le : 24 mars 2025

COMPTES ADMINISTRATEURS GLOBAUX : 9
  (recommandation Microsoft : 2 à 4 maximum)

COMPTES D'ANCIENS EMPLOYÉS ENCORE ACTIFS :
  omar.tazi@datasafe.ma
  Départ : 12/09/2023 | Statut : ACTIF
  Dernière connexion : 03/03/2025 — 14h22

  mourad.alami@datasafe.ma
  Départ : 15/11/2023 | Statut : ACTIF
  Accès données Ministère : OUI
  Dernière connexion : 17/02/2025

  hafsa.chraibi@datasafe.ma
  Fin stage : 30/06/2023 | Statut : ACTIF
  Dernière connexion : 28/01/2025 — IP externe inconnue

TOTAL COMPTES ORPHELINS : 5/35 (14%)
RISQUE CRITIQUE : accès aux données gouvernementales`,
      },
      {
        id: "E-5.15-2",
        label: "Vérifier la politique d'accès",
        type: "config",
        content: `DATASAFE MAROC — POLITIQUE CONTRÔLE D'ACCÈS
Analyse : Azure AD + serveurs Windows
Date    : 24 mars 2025

POLITIQUE DOCUMENTÉE : INEXISTANTE

ÉTAT CONSTATÉ :
  Revue des accès trimestrielle    : NON effectuée
  Principe moindre privilège       : NON appliqué
  RBAC configuré                   : partiellement
  Approbation formelle des accès   : NON
  Processus révocation au départ   : NON formalisé

ACCÈS AUX DONNÉES CLIENTS MINISTÈRE :
  Personnes ayant accès            : 14 consultants
  Personnes ayant besoin réel      : 4 consultants
  Accès excessifs                  : 10 personnes`,
      },
    ],
    defaultRecommendation:
      "Désactiver immédiatement les comptes des ex-employés. Mettre en place une revue semestrielle des accès. Documenter et appliquer le principe du moindre privilège.",
  },
  {
    id: "6.3",
    theme: "Humain",
    title: "Sensibilisation et formation",
    description:
      "Tout le personnel doit recevoir une sensibilisation, une éducation et une formation appropriées en matière de sécurité de l'information.",
    objective:
      "Réduire le risque d'erreur humaine en s'assurant que chaque employé comprend les menaces (phishing, mots de passe, fuites de données) et connaît les comportements attendus en matière de sécurité.",
    question: "Le personnel reçoit-il une formation et une sensibilisation régulières à la sécurité de l'information ?",
    interview: {
      interlocutor: "Nadia Rhimi — DRH",
      exchanges: [
        { q: "Organisez-vous des formations à la sécurité informatique pour vos employés ?", a: "On fait beaucoup de formations techniques — Azure, Windows Server... La sécurité spécifiquement, pas encore, mais c'est prévu." },
        { q: "Depuis combien de temps c'est prévu ?", a: "Depuis... 2022 je dirais. On a eu des priorités différentes chaque année." },
        { q: "Avez-vous une charte informatique signée par tous les employés ?", a: "Oui, on en a une. Elle a été signée par la plupart des gens en 2023." },
        { q: "Tous les employés l'ont signée ?", a: "Les managers oui. Pour les techniciens... je dois vérifier. Il y a peut-être des manques." },
        { q: "Suite à l'incident phishing de janvier, avez-vous organisé une sensibilisation ?", a: "On a envoyé un email pour dire de faire attention. Une vraie formation, pas encore." },
      ],
      auditorNote: "Aucune formation sécurité en 4 ans malgré des incidents. La charte n'est signée que par 51% du personnel. L'incident phishing n'a pas déclenché de plan de formation.",
    },
    evidences: [
      {
        id: "E-6.3-1",
        label: "Consulter le plan de formation",
        type: "document",
        content: `DATASAFE MAROC — REGISTRE FORMATIONS 2023-2024

FORMATIONS SÉCURITÉ ORGANISÉES : 0

Budget formation 2024 :
  Certifications techniques (Azure, Windows) : 45 000 MAD
  Formations commerciales                    : 12 000 MAD
  Formation sécurité informatique            :      0 MAD

Chartes informatiques signées      : 0/35
Sessions phishing simulé           : 0
Modules e-learning sécurité        : aucun

EXIGENCE MINISTÈRE DES FINANCES :
  Preuve de formation sécurité annuelle
  pour tous les consultants intervenant
  sur les systèmes du Ministère.
  DataSafe ne peut pas fournir cette preuve.`,
      },
      {
        id: "E-6.3-2",
        label: "Vérifier les certifications sécurité dans Azure AD",
        type: "log",
        content: `DATASAFE MAROC — AUDIT PROFILS AZURE AD
Date : 24 mars 2025

CERTIFICATIONS TECHNIQUES DÉCLARÉES :
  Azure Administrator (AZ-104)  : 8 consultants
  Azure Solutions Architect     : 3 consultants
  Windows Server MCSA           : 5 consultants

CERTIFICATIONS SÉCURITÉ DÉCLARÉES :
  ISO 27001 Lead Auditor        : 0
  ISO 27001 Lead Implementer    : 0
  CISSP / CISM                  : 0
  Security+ ou équivalent       : 0

FORMATIONS SÉCURITÉ COMPLÉTÉES (Microsoft Learn — tenant DataSafe) :
  Modules sécurité complétés    : 0/35 employés
  Simulations phishing envoyées : 0
  Attestations disponibles      : AUCUNE`,
      },
    ],
    defaultRecommendation:
      "Mettre en place un programme annuel de sensibilisation obligatoire. Réaliser des tests de phishing simulés. Faire signer la charte informatique à tous les employés.",
  },
  {
    id: "6.5",
    theme: "Humain",
    title: "Responsabilités après départ",
    description:
      "Les responsabilités et obligations en matière de sécurité de l'information qui restent valables après la fin ou le changement d'emploi doivent être définies, communiquées et appliquées.",
    objective:
      "Protéger l'organisation contre les accès non autorisés d'anciens employés en révoquant immédiatement tous les accès au départ, et en formalisant les obligations de confidentialité post-contractuelles.",
    question: "Les obligations de sécurité post-départ sont-elles formalisées et les accès révoqués dans les délais ?",
    interview: {
      interlocutor: "Nadia Rhimi — DRH",
      exchanges: [
        { q: "Avez-vous une procédure formalisée pour gérer les départs d'employés ?", a: "On a une checklist pour récupérer le matériel et faire les formalités administratives." },
        { q: "Cette checklist inclut-elle la révocation des accès informatiques ?", a: "Il y a une ligne qui dit de contacter l'IT. Mais c'est Youssef qui gère ça." },
        { q: "Dans quel délai les accès sont-ils révoqués après un départ ?", a: "Ça dépend. Quand on pense à le faire... parfois c'est rapide, parfois ça prend quelques jours." },
        { q: "Les contrats de travail contiennent-ils des clauses de confidentialité post-départ ?", a: "Il y a une clause de confidentialité pendant l'emploi. Après le départ... je ne suis pas sûre." },
        { q: "Savez-vous que 3 anciens employés se sont connectés à vos systèmes ces 3 derniers mois ?", a: "... Non. Ce n'est pas possible. Leurs comptes ont été désactivés." },
      ],
      auditorNote: "La DRH ignore que des ex-employés accèdent encore aux systèmes. Aucune clause post-départ dans les contrats. Délai moyen de révocation : 21 jours.",
    },
    evidences: [
      {
        id: "E-6.5-1",
        label: "Consulter la procédure d'offboarding",
        type: "document",
        content: `DATASAFE MAROC — CHECKLIST DÉPART EMPLOYÉ
Fichier : Fiche_Depart_RH.docx
Statut  : non versionnée, non approuvée

ÉTAPES PRÉSENTES :
  ✓ Récupération badge accès bureaux
  ✓ Récupération laptop et téléphone
  ✗ Révocation Azure AD — "à faire si possible"
  ✗ Révocation accès clients — non mentionnée
  ✗ Révocation VPN — non mentionnée
  ✗ Délai de révocation défini : aucun

DÉLAI MOYEN CONSTATÉ : 21 jours après le départ
EXIGENCE ISO 27001   : révocation en J+0`,
      },
      {
        id: "E-6.5-2",
        label: "Vérifier les connexions des anciens employés",
        type: "log",
        content: `DATASAFE MAROC — LOGS CONNEXIONS AZURE AD
Période : septembre 2023 — mars 2025

CONNEXIONS D'ANCIENS EMPLOYÉS DÉTECTÉES :

  omar.tazi@datasafe.ma (parti 12/09/2023)
  03/03/2025 — 14h22 — Connexion Microsoft 365
  Fichiers accédés : rapports techniques clients

  mourad.alami@datasafe.ma (parti 15/11/2023)
  17/02/2025 — 09h05 — Connexion serveur Windows
  Dossier accédé : \\Clients\\Ministere_Finances\\2024

  hafsa.chraibi@datasafe.ma (fin stage 30/06/2023)
  28/01/2025 — 11h30 — Connexion Azure AD
  Localisation : IP externe inconnue

CONCLUSION : 3 anciens employés accèdent encore aux données
confidentielles de clients gouvernementaux`,
      },
    ],
    defaultRecommendation:
      "Créer une procédure d'offboarding avec checklist sécurité. Ajouter des clauses de confidentialité post-départ dans tous les contrats. Révoquer les accès le jour du départ.",
  },
  {
    id: "7.2",
    theme: "Physique",
    title: "Accès physique",
    description:
      "Les zones sécurisées doivent être protégées par des contrôles d'entrée appropriés pour s'assurer que seul le personnel autorisé est admis.",
    objective:
      "Empêcher tout accès physique non autorisé aux locaux sensibles (salle serveurs, bureaux) et garantir la traçabilité des entrées et sorties via des systèmes de contrôle d'accès adaptés.",
    question: "L'accès physique aux zones sensibles est-il contrôlé et tracé de manière adéquate ?",
    interview: {
      interlocutor: "Mehdi Lahlou — Administrateur Systèmes",
      exchanges: [
        { q: "Comment est sécurisée votre salle serveurs ?", a: "Elle est fermée à clé. On a 4 clés — moi, Youssef, Anas et une clé de secours dans le bureau de Karim." },
        { q: "Avez-vous un système de badge ou de contrôle d'accès électronique ?", a: "Non, juste la serrure classique. On est une petite structure." },
        { q: "Tenez-vous un registre des personnes qui entrent dans la salle serveurs ?", a: "Non, pas de registre. On sait qui a les clés." },
        { q: "Des prestataires externes ont-ils accès à cette salle ?", a: "Le technicien de maintenance réseau vient de temps en temps. Il connaît les locaux." },
        { q: "Est-il escorté lors de ses visites ?", a: "Pas toujours. Quand on est occupés, il vient et fait son travail." },
      ],
      auditorNote: "Aucune traçabilité des accès physiques. Des prestataires circulent sans escorte. La porte de la salle serveurs était ouverte à l'arrivée de l'auditeur.",
    },
    evidences: [
      {
        id: "E-7.2-1",
        label: "Consulter le registre des accès physiques",
        type: "document",
        content: `DATASAFE MAROC — AUDIT SÉCURITÉ PHYSIQUE
Bureaux : 3ème étage, Avenue Hassan II, Rabat
Date visite : 24 mars 2025

SALLE SERVEUR :
  Localisation     : bureau partagé avec équipe IT
  Serrure dédiée   : NON — armoire réseau non verrouillée
  Badge requis     : NON
  Caméra           : 1 fonctionnelle
  Climatisation    : climatiseur mural partagé

REGISTRE VISITEURS :
  Registre papier  : présent, rempli irrégulièrement
  Badge visiteur   : inexistant
  Escorte obligatoire : NON appliquée

PRESTATAIRES AVEC ACCÈS LIBRE :
  Technicien maintenance réseau   : accès non escorté
  Coursier livraisons matériel    : accès open space
  Consultants externes clients    : accès bureaux sans badge`,
      },
      {
        id: "E-7.2-2",
        label: "Analyser le système de contrôle d'accès",
        type: "config",
        content: `DATASAFE MAROC — SYSTÈME CONTRÔLE ACCÈS PHYSIQUE
Date : 24 mars 2025

SYSTÈME BADGE ÉLECTRONIQUE :
  Installé                  : NON
  Journal d'entrées/sorties : INEXISTANT
  Zones sécurisées définies : NON

CAMÉRAS DE SURVEILLANCE :
  Nombre installées         : 2
  Fonctionnelles            : 2
  Enregistrement            : OUI — rétention 7 jours
  Couverture salle serveur  : partielle (angle mort)

ALARME INTRUSION :
  Installée                 : NON

CONSTAT : Aucune traçabilité électronique des accès physiques.
Impossible de savoir qui a accédé à la salle serveur et quand.`,
      },
    ],
    defaultRecommendation:
      "Installer un système de contrôle d'accès par badge RFID pour la salle serveurs. Mettre en place un registre des accès physiques. Appliquer la politique de bureau propre.",
  },
  {
    id: "8.5",
    theme: "Technologique",
    title: "Authentification sécurisée",
    description:
      "Des technologies et des procédures d'authentification sécurisée doivent être mises en œuvre sur la base des restrictions d'accès à l'information et de la politique de contrôle d'accès.",
    objective:
      "S'assurer que l'accès aux systèmes critiques nécessite une authentification forte (MFA), que les mots de passe respectent des règles de complexité, et que les tentatives d'intrusion sont détectées et bloquées.",
    question: "L'authentification multi-facteurs est-elle déployée sur les systèmes critiques ?",
    interview: {
      interlocutor: "Youssef Alami — DSI",
      exchanges: [
        { q: "Avez-vous activé l'authentification multi-facteurs sur Microsoft 365 ?", a: "On l'a activé pour certains comptes. Les managers principalement." },
        { q: "Quel pourcentage de vos utilisateurs ont le MFA activé ?", a: "Je dirais... une dizaine de personnes sur 35. Peut-être moins." },
        { q: "Pourquoi n'est-il pas déployé pour tous ?", a: "Certains employés trouvaient ça contraignant. Et pour les comptes de service, c'est compliqué techniquement." },
        { q: "Quelle est votre politique de mots de passe ?", a: "On demande au moins 8 caractères avec complexité. C'est le standard." },
        { q: "Suite à l'intrusion réussie du 3 février, qu'avez-vous fait ?", a: "On a réinitialisé le mot de passe du compte compromis. Et on surveille." },
      ],
      auditorNote: "MFA à 17% seulement. Aucune politique d'accès conditionnel. L'intrusion réussie du 3 février n'a pas déclenché de renforcement systématique.",
    },
    evidences: [
      {
        id: "E-8.5-1",
        label: "Analyser la politique de mots de passe",
        type: "config",
        content: `DATASAFE MAROC — AUDIT AUTHENTIFICATION
Systèmes : Azure AD + Microsoft 365 + Windows Server
Date     : 24 mars 2025

POLITIQUE MOTS DE PASSE AZURE AD :
  Longueur minimale     : 8 caractères
  Complexité requise    : OUI
  Expiration            : jamais configurée
  MFA activé            : 6/35 comptes (17%)

COMPTES SANS MFA CRITIQUES :
  Administrateurs globaux sans MFA : 4/9
  Comptes accès données Ministère  : 10/14
  Compte service sauvegarde        : sans MFA

ACCÈS DISTANT VPN :
  Authentification      : mot de passe seul
  Double facteur VPN    : NON
  18 consultants accèdent aux données clients
  via VPN sans second facteur`,
      },
      {
        id: "E-8.5-2",
        label: "Analyser les tentatives d'intrusion",
        type: "log",
        content: `DATASAFE MAROC — LOGS SÉCURITÉ AZURE AD
Période : janvier–mars 2025

TENTATIVES DE CONNEXION SUSPECTES :

  15/01/2025 — 02h14 à 04h47
  Compte : k.idrissi@datasafe.ma (admin global)
  Tentatives : 340 depuis IP 185.220.101.x
  Résultat : BLOQUÉ (Azure AD Smart Lockout)

  03/02/2025 — 23h00 à 23h28
  Compte : a.berrada@datasafe.ma
  Tentatives : 89 depuis IP 194.165.16.x
  Résultat : 1 CONNEXION RÉUSSIE
  Alerte reçue : AUCUNE | Action prise : AUCUNE

  Session 03/02/2025 :
  Fichiers accédés : dossiers Ministère des Finances
  Durée            : 47 minutes
  Données exfiltrées : inconnues (logs insuffisants)`,
      },
    ],
    defaultRecommendation:
      "Activer le MFA pour tous les comptes, en priorité les administrateurs. Renforcer la politique de mots de passe (min. 12 caractères). Configurer le verrouillage de compte après 5 tentatives.",
  },
  {
    id: "8.13",
    theme: "Technologique",
    title: "Sauvegarde de l'information",
    description:
      "Des copies de sauvegarde de l'information, des logiciels et des systèmes doivent être effectuées et testées régulièrement conformément à la politique de sauvegarde convenue.",
    objective:
      "Garantir la disponibilité et l'intégrité des données en cas d'incident (ransomware, panne, sinistre) grâce à des sauvegardes régulières, chiffrées, stockées hors site et testées périodiquement.",
    question: "Les sauvegardes sont-elles réalisées, testées et stockées conformément à une politique définie ?",
    interview: {
      interlocutor: "Mehdi Lahlou — Administrateur Systèmes",
      exchanges: [
        { q: "Comment gérez-vous les sauvegardes de vos données ?", a: "On a Windows Server Backup qui tourne tous les dimanches. Ça sauvegarde sur le NAS." },
        { q: "Avez-vous des sauvegardes hors site ou dans le cloud ?", a: "Non, tout est sur le NAS dans la salle serveurs. On a pensé à Azure Backup mais le budget n'a pas été validé." },
        { q: "Quand avez-vous testé la restauration pour la dernière fois ?", a: "Tester... vous voulez dire restaurer vraiment ? On n'a pas fait ça formellement." },
        { q: "Les données Microsoft 365 sont-elles sauvegardées ?", a: "Microsoft garde les données dans le cloud. Je pensais que c'était suffisant." },
        { q: "Êtes-vous alerté en cas d'échec de sauvegarde ?", a: "Il faut aller vérifier manuellement dans les logs. On n'a pas configuré d'alertes automatiques." },
      ],
      auditorNote: "Règle 3-2-1 non respectée. Aucun test de restauration. Les données M365 ne sont pas sauvegardées. 3 échecs détectés dans les logs récents, non signalés.",
    },
    evidences: [
      {
        id: "E-8.13-1",
        label: "Vérifier la configuration des sauvegardes",
        type: "config",
        content: `DATASAFE MAROC — AUDIT SAUVEGARDES
Date : 24 mars 2025

CONFIGURATION ACTUELLE :
  Outil                 : Windows Server Backup
  Fréquence             : hebdomadaire (dimanche 03h00)
  Périmètre             : serveurs Windows uniquement
  Destination           : NAS local — même salle serveur
  Sauvegarde hors site  : NON
  Chiffrement           : NON
  Rétention             : 4 semaines

ÉLÉMENTS NON SAUVEGARDÉS :
  ✗ Données Microsoft 365 (emails, SharePoint)
  ✗ Configuration Azure AD
  ✗ Données laptops consultants terrain

TESTS DE RESTAURATION :
  Dernier test documenté    : jamais
  Procédure de restauration : inexistante`,
      },
      {
        id: "E-8.13-2",
        label: "Consulter les logs de sauvegarde Windows",
        type: "log",
        content: `DATASAFE MAROC — LOGS WINDOWS SERVER BACKUP
Période : octobre 2024 — mars 2025

HISTORIQUE DES SAUVEGARDES :
  06/10/2024 — SUCCÈS — 48 Go
  13/10/2024 — SUCCÈS — 49 Go
  20/10/2024 — ÉCHEC   — Erreur disque NAS (code 0x81000019)
  27/10/2024 — SUCCÈS — 49 Go
  03/11/2024 — SUCCÈS — 50 Go
  ...
  02/03/2025 — ÉCHEC   — Espace disque insuffisant
  09/03/2025 — SUCCÈS — 67 Go
  16/03/2025 — ÉCHEC   — NAS inaccessible (réseau)
  23/03/2025 — SUCCÈS — 67 Go

TAUX DE SUCCÈS : 18/25 sauvegardes (72%)
ALERTES ENVOYÉES EN CAS D'ÉCHEC : NON configurées
SAUVEGARDES MICROSOFT 365 : aucun log trouvé`,
      },
    ],
    defaultRecommendation:
      "Valider et appliquer la politique de sauvegarde. Mettre en place une copie hors site (règle 3-2-1). Réaliser un test de restauration trimestriel. Configurer des alertes en cas d'échec.",
  },
  {
    id: "8.15",
    theme: "Technologique",
    title: "Journalisation (logs)",
    description:
      "Des journaux enregistrant les activités, les exceptions, les défauts et autres événements pertinents doivent être produits, stockés, protégés et analysés.",
    objective:
      "Assurer la traçabilité complète des actions sur les systèmes afin de détecter les incidents de sécurité, reconstituer les événements après une attaque, et prouver la conformité lors d'un audit.",
    question: "Les journaux d'événements sont-ils collectés, protégés et analysés de manière systématique ?",
    interview: {
      interlocutor: "Youssef Alami — DSI",
      exchanges: [
        { q: "Collectez-vous les journaux d'événements de vos systèmes ?", a: "Oui, Windows Event Log est activé sur les serveurs. Azure AD aussi génère des logs." },
        { q: "Ces logs sont-ils centralisés dans un SIEM ?", a: "Non, on n'a pas de SIEM. C'est cher et complexe à mettre en place pour notre taille." },
        { q: "Quelle est la durée de rétention de vos logs ?", a: "Sur les serveurs Windows, je crois que c'est le paramètre par défaut. 30 jours peut-être." },
        { q: "Qui analyse ces logs et à quelle fréquence ?", a: "On les consulte quand il y a un problème. Pas de revue systématique." },
        { q: "Lors de l'intrusion du 3 février, avez-vous pu reconstituer ce que l'attaquant a fait ?", a: "Partiellement. On sait qu'il s'est connecté. Ce qu'il a fait exactement... les logs ne nous donnent pas assez de détails." },
      ],
      auditorNote: "Pas de SIEM, rétention insuffisante (30j vs 90j requis), aucune analyse proactive. L'intrusion du 3 février ne peut pas être reconstituée faute de logs suffisants.",
    },
    evidences: [
      {
        id: "E-8.15-1",
        label: "Analyser la configuration des logs",
        type: "config",
        content: `DATASAFE MAROC — AUDIT JOURNALISATION
Date : 24 mars 2025

LOGS ACTIVÉS :
  Windows Event Log (serveurs)  : OUI — rétention 30 jours
  Azure AD Sign-in logs         : OUI — rétention 30 jours
  Microsoft 365 audit log       : OUI — rétention 90 jours
  VPN access logs               : NON configuré
  Logs accès données clients    : NON

CENTRALISATION :
  SIEM installé                 : NON
  Agrégation des logs           : NON
  Alertes automatiques          : NON
  Protection contre modification: NON

NORME ISO 27002 : rétention minimale 90 jours
SITUATION ACTUELLE : 30 jours pour les logs critiques`,
      },
      {
        id: "E-8.15-2",
        label: "Reconstituer la tentative d'intrusion du 03/02/2025",
        type: "log",
        content: `DATASAFE MAROC — RAPPORT ANALYSE POST-INCIDENT
Incident : connexion suspecte réussie — 03/02/2025

TENTATIVE DE RECONSTITUTION :

  Logs disponibles aujourd'hui (24/03/2025) :
  Azure AD Sign-in     : disponibles (30 jours) ✓
  VPN access logs      : INEXISTANTS ✗
  Windows file access  : INEXISTANTS ✗
  Logs réseau firewall : INEXISTANTS ✗

INFORMATIONS DISPONIBLES :
  ✓ Heure de connexion : 23h00
  ✓ Compte compromis   : a.berrada@datasafe.ma
  ✗ Vecteur d'attaque  : INCONNU
  ✗ Données consultées : INCONNUES (pas de logs fichiers)
  ✗ Données exfiltrées : IMPOSSIBLES À DÉTERMINER

CONCLUSION : Sans centralisation des logs et sans rétention
suffisante, il est impossible de savoir précisément ce que
l'attaquant a fait pendant ses 47 minutes de connexion sur
les données du Ministère des Finances.`,
      },
    ],
    defaultRecommendation:
      "Centraliser les logs dans un SIEM. Augmenter la rétention à 90 jours minimum. Activer les logs applicatifs. Mettre en place une procédure de revue hebdomadaire des alertes.",
  },
  {
    id: "8.7",
    theme: "Technologique",
    title: "Protection contre les malwares",
    description:
      "Des mesures de protection contre les logiciels malveillants doivent être mises en œuvre et combinées à une sensibilisation appropriée des utilisateurs.",
    question: "Les systèmes sont-ils protégés contre les malwares par des solutions à jour et correctement configurées ?",
    evidences: [
      {
        id: "E-8.7-1",
        label: "Vérifier la configuration antivirus",
        type: "config",
        content: `DATASAFE MAROC — RAPPORT ANTIVIRUS / EDR
Outil    : Microsoft Defender for Business
Extrait  : Portail Microsoft 365 Defender — 10/03/2025
────────────────────────────────────────────────────────────────

COUVERTURE DES APPAREILS :
  Postes Windows enrôlés dans Defender  : 28 / 35  (80%)
  Postes non protégés / non enrôlés    :  7 / 35  (20%) ✗
    → 7 laptops Dell Latitude 5540 achetés en 2024
    → Jamais configurés dans le portail Defender

ÉTAT DE LA PROTECTION EN TEMPS RÉEL :
  Protection temps réel activée         : 28/28 postes ✓
  Protection cloud activée              : 12/28 postes ✗
  Analyse comportementale (EDR)         : NON activée ✗
  Contrôle des périphériques USB        : NON configuré ✗

MISES À JOUR DES DÉFINITIONS :
  Postes à jour (< 24h)                 : 19/28 ✓
  Postes avec définitions > 7 jours     :  6/28 ✗
  Postes avec définitions > 30 jours    :  3/28 ✗
    → DATASAFE-PC-014 : dernière MAJ 45 jours
    → DATASAFE-PC-022 : dernière MAJ 38 jours
    → DATASAFE-PC-031 : dernière MAJ 33 jours

SERVEURS :
  DATASAFE-SRV01 : Defender activé ✓ — définitions à jour ✓
  DATASAFE-SRV02 : Defender activé ✓ — définitions à jour ✓
  NAS Synology   : Aucun antivirus installé ✗

⚠ ANOMALIE : 7 postes 2024 sans aucune protection antivirus
⚠ ANOMALIE : 9 postes avec définitions obsolètes (> 7 jours)
⚠ ANOMALIE : NAS contenant 24 To de données sans protection`,
      },
      {
        id: "E-8.7-2",
        label: "Consulter la politique de mise à jour",
        type: "document",
        content: `DATASAFE MAROC — POLITIQUE MISE À JOUR ANTIVIRUS
Recherche dans la GED SharePoint : "antivirus" OR "malware" OR "mise à jour"
────────────────────────────────────────────────────────────────

Résultat : AUCUN DOCUMENT TROUVÉ

Entretien avec M. Youssef Alami (Resp. IT) — 10/03/2025 :
  Q : "Avez-vous une politique formelle de mise à jour antivirus ?"
  R : "On fait confiance aux mises à jour automatiques Windows,
       mais on n'a pas de document écrit là-dessus."

  Q : "Qui vérifie que tous les postes sont bien protégés ?"
  R : "Normalement c'est automatique. On vérifie quand il y a
       un problème signalé."

  Q : "Les nouveaux laptops de 2024 sont-ils configurés ?"
  R : "Ah... je pensais que c'était fait automatiquement
       à l'installation de Windows."

POLITIQUE FORMELLE : INEXISTANTE
Procédure de vérification périodique : INEXISTANTE
Responsable désigné pour la gestion antivirus : NON DÉSIGNÉ

⚠ ANOMALIE : Aucune politique documentée de protection antimalware
⚠ ANOMALIE : Gestion réactive uniquement (pas de surveillance proactive)`,
      },
      {
        id: "E-8.7-3",
        label: "Analyser les journaux de détection",
        type: "log",
        content: `MICROSOFT DEFENDER — JOURNAL DES MENACES DÉTECTÉES
Période : 01/01/2025 – 10/03/2025 | Exporté depuis M365 Defender
────────────────────────────────────────────────────────────────

DATE       │POSTE              │MENACE DÉTECTÉE              │ACTION    │STATUT
───────────┼───────────────────┼─────────────────────────────┼──────────┼──────────
2025-01-08 │DATASAFE-PC-007    │Trojan:Win32/Wacatac.B!ml    │Quarantaine│Résolu ✓
2025-01-15 │DATASAFE-PC-003    │Phishing:HTML/Redir!pz       │Bloqué    │Résolu ✓
2025-01-22 │DATASAFE-PC-019    │HackTool:Win32/Mimikatz!rfn  │MANQUÉ ✗  │Non traité ⚠
2025-02-03 │DATASAFE-PC-011    │Ransom:Win32/Conti.A         │Quarantaine│Résolu ✓
2025-02-14 │DATASAFE-PC-022    │Trojan:Win32/AgentTesla      │MANQUÉ ✗  │Non traité ⚠
2025-02-28 │DATASAFE-SRV01     │Exploit:Win32/CVE-2024-21412 │Bloqué    │Résolu ✓
2025-03-05 │DATASAFE-PC-014    │Spyware:Win32/Keylogger.Gen  │MANQUÉ ✗  │Non traité ⚠

RÉSUMÉ PÉRIODE :
  Total menaces détectées    : 7
  Menaces bloquées/résolues  : 4  (57%)
  Menaces NON détectées      : 3  (43%) — définitions obsolètes
  Alertes envoyées à l'IT    : 0  (aucune notification configurée)
  Incidents documentés       : 0  (aucun registre d'incidents malware)

NOTE : Les 3 menaces "MANQUÉ" concernent des postes avec définitions
> 30 jours. Mimikatz (outil de vol de credentials) non détecté
sur DATASAFE-PC-019 — risque de compromission de comptes AD.

⚠ ANOMALIE CRITIQUE : Mimikatz non détecté — possible vol de credentials
⚠ ANOMALIE : 43% des menaces non détectées faute de MAJ des définitions`,
      },
    ],
    defaultRecommendation:
      "Enrôler immédiatement les 7 postes 2024 dans Microsoft Defender. Activer la mise à jour automatique des définitions (max 4h). Déployer la protection cloud et l'EDR. Rédiger une politique antimalware formelle.",
  },
  {
    id: "8.16",
    theme: "Technologique",
    title: "Monitoring des activités",
    description:
      "Les réseaux, systèmes et applications doivent être surveillés pour détecter les comportements anormaux et les incidents de sécurité potentiels.",
    question: "Un système de monitoring continu est-il en place pour détecter les incidents et comportements anormaux ?",
    evidences: [
      {
        id: "E-8.16-1",
        label: "Vérifier la configuration du monitoring",
        type: "config",
        content: `DATASAFE MAROC — AUDIT SYSTÈME DE MONITORING
Date : 10 mars 2025 | Auditeur : [Auditeur externe]
────────────────────────────────────────────────────────────────

OUTILS DE MONITORING EN PLACE :
  SIEM (Security Information & Event Management) : INEXISTANT ✗
  IDS/IPS réseau                                 : NON déployé ✗
  Monitoring infrastructure (Nagios, Zabbix...)  : INEXISTANT ✗
  Monitoring Azure AD (Microsoft Sentinel)       : NON activé ✗
  Tableau de bord sécurité centralisé            : INEXISTANT ✗

SURVEILLANCE ACTUELLE (informelle) :
  Vérification manuelle des logs Windows         : Occasionnelle
  Consultation portail Azure AD                  : Sur incident
  Vérification logs Fortinet                     : Jamais
  Alertes email automatiques                     : AUCUNE configurée

COUVERTURE DU MONITORING :
  Système              │ Surveillé │ Alertes │ Rétention
  ─────────────────────┼───────────┼─────────┼──────────
  DATASAFE-SRV01/02    │ NON       │ NON     │ 7 jours
  Azure AD / M365      │ NON       │ NON     │ 30 jours
  Firewall FortiGate   │ NON       │ NON     │ 14 jours
  NAS Synology         │ NON       │ NON     │ 7 jours
  Postes de travail    │ NON       │ NON     │ —

Entretien M. Alami : "On n'a pas de monitoring en temps réel.
On est alertés par les utilisateurs quand quelque chose ne va pas."

⚠ ANOMALIE CRITIQUE : Aucun système de monitoring en place
⚠ ANOMALIE : Détection des incidents 100% dépendante des utilisateurs`,
      },
      {
        id: "E-8.16-2",
        label: "Consulter les journaux d'activité",
        type: "log",
        content: `DATASAFE MAROC — ANALYSE JOURNAUX D'ACTIVITÉ
Période analysée : janvier – mars 2025
Source : Logs Windows Event Viewer (export manuel)
────────────────────────────────────────────────────────────────

ÉVÉNEMENTS CRITIQUES NON TRAITÉS (extraits) :

EventID 4625 — Échecs de connexion (Account Logon Failure)
  2025-01-15 11:18 à 11:22 : 45 échecs sur admin@datasafe.ma
  → Tentative de brute force — NON DÉTECTÉE en temps réel

EventID 4648 — Connexion avec credentials explicites
  2025-01-22 09:05 : rachid.benali (ex-employé) → DATASAFE-SRV01
  → Accès non autorisé — NON DÉTECTÉ en temps réel

EventID 7045 — Nouveau service installé
  2025-02-14 03:22 : Service "WindowsHelper32" installé sur PC-022
  → Possible malware persistant — NON DÉTECTÉ

EventID 4720 — Compte utilisateur créé
  2025-03-01 14:11 : Compte "svc_backup2" créé sans demande RH
  → Compte fantôme potentiel — NON DÉTECTÉ

────────────────────────────────────────────────────────────────
STATISTIQUES PÉRIODE :
  Événements critiques générés    : 847
  Événements analysés par l'IT    : 0   (0%)
  Incidents détectés via logs     : 0   (0%)
  Incidents détectés par users    : 3 (100%)
  Délai moyen de détection        : 12 jours

⚠ ANOMALIE CRITIQUE : Service suspect installé à 03h22 — non détecté
⚠ ANOMALIE CRITIQUE : Compte fantôme créé — non détecté pendant 9 jours`,
      },
      {
        id: "E-8.16-3",
        label: "Vérifier les alertes de sécurité",
        type: "registre",
        content: `DATASAFE MAROC — REGISTRE DES ALERTES DE SÉCURITÉ
Période : 2024 – mars 2025
────────────────────────────────────────────────────────────────

ALERTES AUTOMATIQUES CONFIGURÉES :
  Microsoft Defender (M365)    : 0 alerte configurée ✗
  Azure AD Identity Protection : 0 alerte configurée ✗
  Fortinet FortiGate           : 0 alerte configurée ✗
  Windows Event Log            : 0 alerte configurée ✗
  NAS Synology                 : 0 alerte configurée ✗

ALERTES REÇUES PAR L'ÉQUIPE IT (2024-2025) :
  Alertes automatiques reçues  : 0
  Signalements utilisateurs    : 6
  Signalements clients externes: 1 (CIH Bank — oct. 2024)

PROCÉDURE DE RÉPONSE AUX ALERTES :
  Document formalisé           : INEXISTANT ✗
  Responsable de garde (astreinte) : NON DÉSIGNÉ ✗
  SLA de réponse défini        : NON ✗
  Escalade définie             : NON ✗

TABLEAU DE BORD SÉCURITÉ :
  Outil de visualisation       : INEXISTANT ✗
  Rapport mensuel sécurité     : JAMAIS PRODUIT ✗
  Indicateurs KPI sécurité     : NON DÉFINIS ✗

⚠ ANOMALIE CRITIQUE : Zéro alerte automatique sur l'ensemble du SI
⚠ ANOMALIE : Un client bancaire a détecté un incident avant DataSafe`,
      },
    ],
    defaultRecommendation:
      "Déployer Microsoft Sentinel (SIEM natif Azure) pour centraliser les logs et créer des alertes automatiques. Définir des règles de détection pour les événements critiques. Nommer un responsable de surveillance et établir des SLA de réponse.",
  },
];
