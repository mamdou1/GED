// scripts/insertTypeDocuments.js
const db = require("../models");

async function insertTypeDocuments() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log("🚀 Début de l'insertion des types de documents...\n");

    // ============================================
    // Données des types de documents
    // ============================================
    const typeDocumentsData = [
      // ============================================
      // SA - Service Archives (TD-001 à TD-009)
      // ============================================
      { code: "TD-001", cote: "1 SA", nom: "Fiche initiée/affectée/reçue" },
      {
        code: "TD-002",
        cote: "2 SA",
        nom: "Courrier initié/affecté/départ/arrivée",
      },
      {
        code: "TD-003",
        cote: "3 SA",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-004",
        cote: "4 SA",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-005",
        cote: "5 SA",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-006",
        cote: "6 SA",
        nom: "Document de synthèse et d'analyse (Compte rendu/Procès-verbal)",
      },
      { code: "TD-007", cote: "7 SA", nom: "Notes de Service" },
      { code: "TD-008", cote: "8 SA", nom: "Notes d'information" },
      { code: "TD-009", cote: "9 SA", nom: "Décision" },
      { code: "TD-010", cote: "10 SA", nom: "Communiqué" },
      {
        code: "TD-011",
        cote: "11 SA",
        nom: "Registre de courrier Départ/Arrivée et registre des contrats des prestataires",
      },
      { code: "TD-012", cote: "12 SA", nom: "Bordereau de transmission" },

      // ============================================
      // PL - Passation des Marchés et Logistique (TD-013 à TD-030)
      // ============================================
      { code: "TD-013", cote: "1 PL", nom: "Fiche initiée/affectée" },
      { code: "TD-014", cote: "2 PL", nom: "Courrier initié/affecté" },
      {
        code: "TD-015",
        cote: "3 PL",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-016",
        cote: "4 PL",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-017",
        cote: "5 PL",
        nom: "Document de synthèse et d'analyse annuel",
      },
      { code: "TD-018", cote: "6 PL", nom: "Ordre de mission" },
      {
        code: "TD-019",
        cote: "7 PL",
        nom: "Terme de Référence de mission (TDR)",
      },
      { code: "TD-020", cote: "8 PL", nom: "Contrat de prestation de service" },
      { code: "TD-021", cote: "9 PL", nom: "Contrat de fourniture de biens" },
      { code: "TD-022", cote: "10 PL", nom: "Contrat de travaux" },
      { code: "TD-023", cote: "11 PL", nom: "Avenant à contrat" },
      { code: "TD-024", cote: "12 PL", nom: "Bons de réception (souche)" },
      { code: "TD-025", cote: "13 PL", nom: "Bons de commande (souche)" },
      {
        code: "TD-026",
        cote: "14 PL",
        nom: "Demande d'approvisionnement (souche)",
      },
      {
        code: "TD-027",
        cote: "15 PL",
        nom: "Carnet de demande de fournitures",
      },
      { code: "TD-028", cote: "16 PL", nom: "Procès-verbal de réception" },
      { code: "TD-029", cote: "17 PL", nom: "Dossier d'incorporation" },
      { code: "TD-030", cote: "18 PL", nom: "Bordereau de livraison" },
      { code: "TD-031", cote: "19 PL", nom: "Fiche de sortie des fournitures" },
      {
        code: "TD-032",
        cote: "20 PL",
        nom: "Fiche de mise à disposition des immobilisations",
      },
      {
        code: "TD-033",
        cote: "21 PL",
        nom: "Fiche de transfert des immobilisations",
      },
      {
        code: "TD-034",
        cote: "22 PL",
        nom: "Fiche d'inventaire des biens mobiliers",
      },
      {
        code: "TD-035",
        cote: "23 PL",
        nom: "Fiche de signalisation des pannes",
      },
      {
        code: "TD-036",
        cote: "24 PL",
        nom: "Dossier de marché (Avis d'appel à candidature, PV d'ouverture, PV d'attribution provisoire, Rapport d'évaluation, PV de négociation, Avis d'attribution définitive, Contrat de marché pour signature, Contrat de marché pour enregistrement, Demande/Requête adressée à la DNCMP/ARMP, Offres techniques financières et administratives, etc.)",
      },
      {
        code: "TD-037",
        cote: "25 PL",
        nom: "Plan et avis général de passation des Marchés Publics",
      },
      {
        code: "TD-038",
        cote: "26 PL",
        nom: "PV de réception technique, provisoire et définitive",
      },
      { code: "TD-039", cote: "27 PL", nom: "Contrat et Avenant" },

      // ============================================
      // ARCH - Archives (TD-040 à TD-049)
      // ============================================
      { code: "TD-040", cote: "1 ARCH", nom: "Fiche initiée/affectée/reçue" },
      {
        code: "TD-041",
        cote: "2 ARCH",
        nom: "Courrier initié/affecté/départ/arrivée",
      },
      {
        code: "TD-042",
        cote: "3 ARCH",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-043",
        cote: "4 ARCH",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-044",
        cote: "5 ARCH",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-045",
        cote: "6 ARCH",
        nom: "Document de synthèse et d'analyse (Compte rendu/Rapport)",
      },
      { code: "TD-046", cote: "7 ARCH", nom: "Outils de gestion des archives" },
      { code: "TD-047", cote: "8 ARCH", nom: "Fiche typologique de documents" },
      { code: "TD-048", cote: "9 ARCH", nom: "Registre de communication" },
      { code: "TD-049", cote: "10 ARCH", nom: "Bordereau de versement" },
      { code: "TD-050", cote: "11 ARCH", nom: "Fiche de prêt de document" },
      {
        code: "TD-051",
        cote: "12 ARCH",
        nom: "Ouvrages pédagogiques acquis par la Société",
      },
      {
        code: "TD-052",
        cote: "13 ARCH",
        nom: "Documents relatifs aux travaux de d'élimination de documents",
      },

      // ============================================
      // APRS - Administration du Personnel et des Ressources Sociales (TD-053 à TD-064)
      // ============================================
      { code: "TD-053", cote: "1 APRS", nom: "Fiche initiée/affectée" },
      { code: "TD-054", cote: "2 APRS", nom: "Courrier initié/affecté" },
      {
        code: "TD-055",
        cote: "3 APRS",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-056",
        cote: "4 APRS",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-057",
        cote: "5 APRS",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-058",
        cote: "6 APRS",
        nom: "Document de synthèse et d'analyse (Procès-verbaux/Compte rendu/Rapport)",
      },
      { code: "TD-059", cote: "7 APRS", nom: "Fiche de poste" },
      { code: "TD-060", cote: "8 APRS", nom: "Demande de stage / Emploi" },
      { code: "TD-061", cote: "9 APRS", nom: "Autorisation de stage" },
      {
        code: "TD-062",
        cote: "10 APRS",
        nom: "Attestation de stage, de travail, etc./Certificat de travail",
      },
      { code: "TD-063", cote: "11 APRS", nom: "Sécurité sociale" },
      { code: "TD-064", cote: "12 APRS", nom: "Dossier du personnel inactif" },
      { code: "TD-065", cote: "13 APRS", nom: "Assurance" },
      { code: "TD-066", cote: "14 APRS", nom: "Bordereau de transmission" },

      // ============================================
      // RGPM - Ressources et Gestion du Personnel (TD-067 à TD-074)
      // ============================================
      { code: "TD-067", cote: "1 RGPM", nom: "Fiche initiée/affectée" },
      { code: "TD-068", cote: "2 RGPM", nom: "Courrier initié/affecté" },
      {
        code: "TD-069",
        cote: "3 RGPM",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-070",
        cote: "4 RGPM",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-071",
        cote: "5 RGPM",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-072",
        cote: "6 RGPM",
        nom: "Document de synthèse et d'analyse (Procès-verbaux/Compte rendu/Rapport de passation de service)",
      },
      { code: "TD-073", cote: "7 RGPM", nom: "Fiche d'évaluation" },
      { code: "TD-074", cote: "8 RGPM", nom: "Autorisation de stage" },
      {
        code: "TD-075",
        cote: "9 RGPM",
        nom: "Dossiers des stagiaires (académique et professionnel)",
      },
      {
        code: "TD-076",
        cote: "10 RGPM",
        nom: "Document de synthèse et d'analyse de productivité et rentabilité",
      },
      {
        code: "TD-077",
        cote: "11 RGPM",
        nom: "Document de synthèse et d'analyse de contrôle de qualité",
      },
      {
        code: "TD-078",
        cote: "12 RGPM",
        nom: "Document de synthèse et d'analyse sur la gestion des réclamations",
      },
      {
        code: "TD-079",
        cote: "13 RGPM",
        nom: "Certification de produit et/ou services",
      },

      // ============================================
      // SF - Suivi et Formation (TD-080 à TD-084)
      // ============================================
      { code: "TD-080", cote: "1 SF", nom: "Fiche initiée/affectée" },
      { code: "TD-081", cote: "2 SF", nom: "Courrier initié/affecté" },
      {
        code: "TD-082",
        cote: "3 SF",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-083",
        cote: "4 SF",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-084",
        cote: "5 SF",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-085",
        cote: "6 SF",
        nom: "Document de synthèse et d'analyse (Procès-verbaux/Compte rendu/Rapport)",
      },
      {
        code: "TD-086",
        cote: "7 SF",
        nom: "Formation du personnel/Modules et autres documents entrant dans le cadre de la formation du personnel",
      },

      // ============================================
      // SCo - Service Comptable (TD-087 à TD-099)
      // ============================================
      { code: "TD-087", cote: "1 SCo", nom: "Fiche initiée/affectée" },
      { code: "TD-088", cote: "2 SCo", nom: "Courrier initié/affecté" },
      {
        code: "TD-089",
        cote: "3 SCo",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-090",
        cote: "4 SCo",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-091",
        cote: "5 SCo",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-092",
        cote: "6 SCo",
        nom: "Document de synthèse et d'analyse du commissariat aux comptes",
      },
      { code: "TD-093", cote: "7 SCo", nom: "État de rapprochement guichet" },
      {
        code: "TD-094",
        cote: "8 SCo",
        nom: "État de rapprochement bancaire Siège",
      },
      {
        code: "TD-095",
        cote: "9 SCo",
        nom: "État de rapprochement Comptabilité - Informatique",
      },
      {
        code: "TD-096",
        cote: "10 SCo",
        nom: "État de rapprochement ligne de crédit et fonctionnement (Agences)",
      },
      {
        code: "TD-097",
        cote: "11 SCo",
        nom: "État de rapprochement Épargne",
      },
      {
        code: "TD-098",
        cote: "12 SCo",
        nom: "Pièce de Caisse Menues Dépenses",
      },
      { code: "TD-099", cote: "13 SCo", nom: "Note sur états financiers" },
      {
        code: "TD-100",
        cote: "14 SCo",
        nom: "Dossier de déclarations fiscales et sociales (fiscalité)",
      },
      {
        code: "TD-101",
        cote: "15 SCo",
        nom: "Dossier de paiements des fournisseurs et autres prestataires",
      },
      { code: "TD-102", cote: "16 SCo", nom: "Grand-livre et balance" },

      // ============================================
      // STF - Service Trésorerie et Finance (TD-103 à TD-118)
      // ============================================
      { code: "TD-103", cote: "1 STF", nom: "Fiche initiée/affectée" },
      { code: "TD-104", cote: "2 STF", nom: "Courrier initié/affecté" },
      {
        code: "TD-105",
        cote: "3 STF",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-106",
        cote: "4 STF",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-107",
        cote: "5 STF",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-108",
        cote: "6 STF",
        nom: "Document de synthèse et d'analyse financier",
      },
      {
        code: "TD-109",
        cote: "7 STF",
        nom: "Document de synthèse et d'analyse point journalier de la trésorerie",
      },
      { code: "TD-110", cote: "8 STF", nom: "Convention de crédit" },
      { code: "TD-111", cote: "9 STF", nom: "Convention de nantissement" },
      {
        code: "TD-112",
        cote: "10 STF",
        nom: "Convention de Dépôt à Terme (DAT)",
      },
      { code: "TD-113", cote: "11 STF", nom: "Indicateurs périodiques" },
      { code: "TD-114", cote: "12 STF", nom: "Ordre de virement" },
      { code: "TD-115", cote: "13 STF", nom: "Avis de crédit" },
      { code: "TD-116", cote: "14 STF", nom: "État financier" },
      { code: "TD-117", cote: "15 STF", nom: "État de paiement" },
      { code: "TD-118", cote: "16 STF", nom: "Relevé de compte bancaire" },
      { code: "TD-119", cote: "17 STF", nom: "Ordre d'émission de chèque" },
      {
        code: "TD-120",
        cote: "18 STF",
        nom: "Talon de chèque, souche, carnet et affecté manuel",
      },
      { code: "TD-121", cote: "19 STF", nom: "Fiscalité" },
      { code: "TD-122", cote: "20 STF", nom: "Salaire" },
      { code: "TD-123", cote: "21 STF", nom: "Fiche de paie" },

      // ============================================
      // BCG - Budgétisation et Contrôle de Gestion (TD-124 à TD-130)
      // ============================================
      { code: "TD-124", cote: "1 BCG", nom: "Fiche initiée/affectée" },
      { code: "TD-125", cote: "2 BCG", nom: "Courrier initié/affecté" },
      {
        code: "TD-126",
        cote: "3 BCG",
        nom: "Document de synthèse et d'analyse mensuel d'exécution du budget",
      },
      {
        code: "TD-127",
        cote: "4 BCG",
        nom: "Document de synthèse et d'analyse trimestriel d'exécution du budget",
      },
      {
        code: "TD-128",
        cote: "5 BCG",
        nom: "Document de synthèse et d'analyse annuel d'exécution du budget et du PTA",
      },
      {
        code: "TD-129",
        cote: "6 BCG",
        nom: "Plan de travail annuel et Budget général",
      },
      {
        code: "TD-130",
        cote: "7 BCG",
        nom: "Tableau de bord des indicateurs et données significatives de gestion",
      },
      {
        code: "TD-131",
        cote: "8 BCG",
        nom: "Relevé de décision de réallocation budgétaire",
      },
      {
        code: "TD-132",
        cote: "9 BCG",
        nom: "Relevé de décision d'approbation du budget par le Conseil d'Administration",
      },
      {
        code: "TD-133",
        cote: "10 BCG",
        nom: "Plan stratégique et plan d'affaires",
      },

      // ============================================
      // SCR - Service Crédit et Recouvrement (TD-134 à TD-140)
      // ============================================
      { code: "TD-134", cote: "1 SCR", nom: "Fiche initiée/affectée" },
      { code: "TD-135", cote: "2 SCR", nom: "Courrier initié/affecté" },
      {
        code: "TD-136",
        cote: "3 SCR",
        nom: "Document de synthèse et d'analyse périodique d'activité",
      },
      {
        code: "TD-137",
        cote: "4 SCR",
        nom: "Document de synthèse et d'analyse périodique de recouvrement",
      },
      {
        code: "TD-138",
        cote: "5 SCR",
        nom: "Document de synthèse et d'analyse périodique de mission",
      },
      { code: "TD-139", cote: "6 SCR", nom: "Pièces de caisse" },
      { code: "TD-140", cote: "7 SCR", nom: "Pièces comptables Agences" },
      {
        code: "TD-141",
        cote: "8 SCR",
        nom: "Dossier de partenariat (MCM ALAFIA, FNDA, ARCH, PDPIM, etc.)",
      },

      // ============================================
      // EOD - Exploitation et Organisation Documentaire (TD-142 à TD-146)
      // ============================================
      { code: "TD-142", cote: "1 EOD", nom: "Fiche initiée/affectée" },
      { code: "TD-143", cote: "2 EOD", nom: "Courrier initié/affecté" },
      {
        code: "TD-144",
        cote: "3 EOD",
        nom: "Document de synthèse et d'analyse des activités d'épargne",
      },
      {
        code: "TD-145",
        cote: "4 EOD",
        nom: "Document de synthèse et d'analyse journalier de réalisation de tontine",
      },
      {
        code: "TD-146",
        cote: "5 EOD",
        nom: "Document de synthèse et d'analyse point hebdomadaire des opérations d'épargne",
      },
      {
        code: "TD-147",
        cote: "6 EOD",
        nom: "Registre de gestion des cartes NFC",
      },
      {
        code: "TD-148",
        cote: "7 EOD",
        nom: "Registre de gestion des comptes clients",
      },

      // ============================================
      // MDP - Marketing, Développement et Promotion (TD-149 à TD-158)
      // ============================================
      { code: "TD-149", cote: "1 MDP", nom: "Fiche initiée/affectée" },
      { code: "TD-150", cote: "2 MDP", nom: "Courrier initié/affecté" },
      {
        code: "TD-151",
        cote: "3 MDP",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-152",
        cote: "4 MDP",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-153",
        cote: "5 MDP",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-154",
        cote: "6 MDP",
        nom: "Document de synthèse et d'analyse de mission",
      },
      {
        code: "TD-155",
        cote: "7 MDP",
        nom: "Document de synthèse et d'analyse Call Center",
      },
      {
        code: "TD-156",
        cote: "8 MDP",
        nom: "Document de synthèse et d'analyse traitement des plaintes",
      },
      {
        code: "TD-157",
        cote: "9 MDP",
        nom: "Document de synthèse et d'analyse étude de marché",
      },
      {
        code: "TD-158",
        cote: "10 MDP",
        nom: "Document de synthèse et d'analyse étude d'ouvertures des points de services",
      },
      {
        code: "TD-159",
        cote: "11 MDP",
        nom: "Document de synthèse et d'analyse satisfaction client",
      },
      {
        code: "TD-160",
        cote: "12 MDP",
        nom: "Document de synthèse et d'analyse satisfaction du personnel",
      },
      { code: "TD-161", cote: "13 MDP", nom: "Questionnaires" },
      {
        code: "TD-162",
        cote: "14 MDP",
        nom: "Guide de discussion pour FOCUS Group ou autres",
      },
      { code: "TD-163", cote: "15 MDP", nom: "Carte de vœux" },
      { code: "TD-164", cote: "16 MDP", nom: "Carte de visite" },
      { code: "TD-165", cote: "17 MDP", nom: "Carte d'invitation" },
      {
        code: "TD-166",
        cote: "18 MDP",
        nom: "Avis et propositions sur dossier de sponsoring",
      },
      {
        code: "TD-167",
        cote: "19 MDP",
        nom: "Encarts publicitaires, Flyers-prospectus, Prémaquettes et maquettes de supports de communication, etc.",
      },
      {
        code: "TD-168",
        cote: "20 MDP",
        nom: "Cérémonie officielle et activité spéciale",
      },

      // ============================================
      // SAVT - Suivi et Appui à la Vie des Technologies (TD-169 à TD-173)
      // ============================================
      { code: "TD-169", cote: "1 SAVT", nom: "Fiche initiée/affectée" },
      { code: "TD-170", cote: "2 SAVT", nom: "Courrier initié/affecté" },
      {
        code: "TD-171",
        cote: "3 SAVT",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-172",
        cote: "4 SAVT",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-173",
        cote: "5 SAVT",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-174",
        cote: "6 SAVT",
        nom: "Document de synthèse et d'analyse (Procès-verbal de réception)",
      },
      { code: "TD-175", cote: "7 SAVT", nom: "Manuel de formation" },

      // ============================================
      // DTD - Développement Technologique et Digital (TD-176 à TD-180)
      // ============================================
      { code: "TD-176", cote: "1 DTD", nom: "Fiche initiée/affectée" },
      { code: "TD-177", cote: "2 DTD", nom: "Courrier initié/affecté" },
      {
        code: "TD-178",
        cote: "3 DTD",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-179",
        cote: "4 DTD",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-180",
        cote: "5 DTD",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-181",
        cote: "6 DTD",
        nom: "Document de synthèse et d'analyse (Procès-verbal de réception)",
      },
      { code: "TD-182", cote: "7 DTD", nom: "Manuel de formation" },

      // ============================================
      // GSSI - Gestion de la Sécurité des Systèmes d'Information (TD-183 à TD-188)
      // ============================================
      { code: "TD-183", cote: "1 GSSI", nom: "Fiche initiée/affectée" },
      { code: "TD-184", cote: "2 GSSI", nom: "Courrier initié/affecté" },
      {
        code: "TD-185",
        cote: "3 GSSI",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-186",
        cote: "4 GSSI",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-187",
        cote: "5 GSSI",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-188",
        cote: "6 GSSI",
        nom: "Document de synthèse et d'analyse (Procès-verbal de réception)",
      },
      { code: "TD-189", cote: "7 GSSI", nom: "Manuel de formation" },
      { code: "TD-190", cote: "8 GSSI", nom: "Synthèse d'information" },

      // ============================================
      // CADG - Contrôle et Audit de Direction Générale (TD-191 à TD-193)
      // ============================================
      { code: "TD-191", cote: "1 CADG", nom: "Fiche initiée/affectée" },
      { code: "TD-192", cote: "2 CADG", nom: "Courrier initié/affecté" },
      {
        code: "TD-193",
        cote: "3 CADG",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-194",
        cote: "4 CADG",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-195",
        cote: "5 CADG",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-196",
        cote: "6 CADG",
        nom: "Document de synthèse et d'analyse (Rapport de contrôle)",
      },

      // ============================================
      // CAA - Contrôle et Audit des Agences (TD-197 à TD-199)
      // ============================================
      { code: "TD-197", cote: "1 CAA", nom: "Fiche initiée/affectée" },
      { code: "TD-198", cote: "2 CAA", nom: "Courrier initié/affecté" },
      {
        code: "TD-199",
        cote: "3 CAA",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-200",
        cote: "4 CAA",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-201",
        cote: "5 CAA",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-202",
        cote: "6 CAA",
        nom: "Document de synthèse et d'analyse (Rapport de contrôle)",
      },

      // ============================================
      // AR - Analyse des Risques (TD-203 à TD-206)
      // ============================================
      { code: "TD-203", cote: "1 AR", nom: "Fiche initiée/affectée" },
      { code: "TD-204", cote: "2 AR", nom: "Courrier initié/affecté" },
      {
        code: "TD-205",
        cote: "3 AR",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-206",
        cote: "4 AR",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-207",
        cote: "5 AR",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-208",
        cote: "6 AR",
        nom: "Document de synthèse et d'analyse de crédit",
      },
      {
        code: "TD-209",
        cote: "7 AR",
        nom: "Document de synthèse et d'analyse d'épargne",
      },
      {
        code: "TD-210",
        cote: "8 AR",
        nom: "Document de synthèse et d'analyse étude de marché",
      },
      {
        code: "TD-211",
        cote: "9 AR",
        nom: "Document de synthèse et d'analyse de la concurrence",
      },
      {
        code: "TD-212",
        cote: "10 AR",
        nom: "Document de synthèse et d'analyse satisfaction client",
      },
      {
        code: "TD-213",
        cote: "11 AR",
        nom: "Document de synthèse et d'analyse satisfaction du personnel",
      },
      { code: "TD-214", cote: "12 AR", nom: "Synthèse d'Informations" },

      // ============================================
      // SR - Suivi et Reporting (TD-215 à TD-221)
      // ============================================
      { code: "TD-215", cote: "1 SR", nom: "Fiche initiée/affectée" },
      { code: "TD-216", cote: "2 SR", nom: "Courrier initié/affecté" },
      { code: "TD-217", cote: "3 SR", nom: "Données statistiques" },
      { code: "TD-218", cote: "4 SR", nom: "Bulletin des chiffres" },
      { code: "TD-219", cote: "5 SR", nom: "Fichier des gros débiteurs" },
      { code: "TD-220", cote: "6 SR", nom: "Indicateurs périodiques" },
      {
        code: "TD-221",
        cote: "7 SR",
        nom: "Document de synthèse et d'analyse mensuel d'activités",
      },
      {
        code: "TD-222",
        cote: "8 SR",
        nom: "Document de synthèse et d'analyse trimestriel d'activités",
      },
      {
        code: "TD-223",
        cote: "9 SR",
        nom: "Document de synthèse et d'analyse annuel d'activités",
      },
      {
        code: "TD-224",
        cote: "10 SR",
        nom: "Document de synthèse et d'analyse de déclaration à la CENTIF",
      },
      {
        code: "TD-225",
        cote: "11 SR",
        nom: "Document de synthèse et d'analyse circonstancié",
      },

      // ============================================
      // PAI - Planification et Audit Interne (TD-226 à TD-230)
      // ============================================
      { code: "TD-226", cote: "1 PAI", nom: "Fiche initiée/affectée" },
      { code: "TD-227", cote: "2 PAI", nom: "Courrier initié/affecté" },
      {
        code: "TD-228",
        cote: "3 PAI",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-229",
        cote: "4 PAI",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-230",
        cote: "5 PAI",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-231",
        cote: "6 PAI",
        nom: "Document de synthèse et d'analyse de mission élargie",
      },
      {
        code: "TD-232",
        cote: "7 PAI",
        nom: "Document de synthèse et d'analyse de mission d'investigations",
      },
      {
        code: "TD-233",
        cote: "8 PAI",
        nom: "Document de synthèse et d'analyse d'audit de portefeuilles",
      },
      {
        code: "TD-234",
        cote: "9 PAI",
        nom: "Document de synthèse et d'analyse de contrôle global",
      },
      {
        code: "TD-235",
        cote: "10 PAI",
        nom: "Synthèse d'informations sur les opérations et synthèse de reporting périodique (CB, CA)",
      },

      // ============================================
      // CJ - Contentieux et Juridique (TD-236 à TD-249)
      // ============================================
      { code: "TD-236", cote: "1 CJ", nom: "Fiche initiée/affectée" },
      { code: "TD-237", cote: "2 CJ", nom: "Courrier initié/affecté" },
      {
        code: "TD-238",
        cote: "3 CJ",
        nom: "Document de synthèse et d'analyse mensuel d'activités",
      },
      {
        code: "TD-239",
        cote: "4 CJ",
        nom: "Document de synthèse et d'analyse trimestriel d'activités",
      },
      {
        code: "TD-240",
        cote: "5 CJ",
        nom: "Document de synthèse et d'analyse annuel d'activités",
      },
      { code: "TD-241", cote: "6 CJ", nom: "Contrat de Dépôt à Terme (DAT)" },
      { code: "TD-242", cote: "7 CJ", nom: "Contrat de partenariat" },
      { code: "TD-243", cote: "8 CJ", nom: "Contrat de prestation de service" },
      { code: "TD-244", cote: "9 CJ", nom: "Contrat de bail" },
      { code: "TD-245", cote: "10 CJ", nom: "Dossier de contentieux client" },
      {
        code: "TD-246",
        cote: "11 CJ",
        nom: "Dossier de contentieux personnel prestataire",
      },
      { code: "TD-247", cote: "12 CJ", nom: "Dossier de prêt au personnel" },
      {
        code: "TD-248",
        cote: "13 CJ",
        nom: "Dossier de client concernant sa garantie (demande de copie, substitution, etc.)",
      },
      { code: "TD-249", cote: "14 CJ", nom: "Convention de garantie réelle" },
      { code: "TD-250", cote: "15 CJ", nom: "Avis juridique" },
      { code: "TD-251", cote: "16 CJ", nom: "Acte de cautionnement" },

      // ============================================
      // CC - Cellule de Conformité (TD-252 à TD-254)
      // ============================================
      { code: "TD-252", cote: "1 CC", nom: "Fiche initiée/affectée" },
      { code: "TD-253", cote: "2 CC", nom: "Courrier initié/affecté" },
      {
        code: "TD-254",
        cote: "3 CC",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-255",
        cote: "4 CC",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-256",
        cote: "5 CC",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },

      // ============================================
      // Documents Spécifiques (TD-257 à TD-280)
      // ============================================
      {
        code: "TD-257",
        cote: "DG",
        nom: "Document appartenant spécialement à la Direction Générale",
      },
      {
        code: "TD-258",
        cote: "SDG",
        nom: "Document appartenant spécialement au Secrétariat du Directeur Général",
      },
      {
        code: "TD-259",
        cote: "CSSI",
        nom: "Document appartenant spécialement à la Cellule de la Sécurité du Système d'Information",
      },
      {
        code: "TD-260",
        cote: "CC/LCBCFT",
        nom: "Document appartenant spécialement à la Cellule de la Conformité et de la LBCFT",
      },
      {
        code: "TD-261",
        cote: "CJ",
        nom: "Document appartenant spécialement à la Cellule Juridique",
      },
      {
        code: "TD-262",
        cote: "DAL",
        nom: "Document appartenant spécialement à la Direction de l'Administration et des Finances",
      },
      {
        code: "TD-263",
        cote: "DRH",
        nom: "Document appartenant spécialement à la Direction des Ressources Humaines",
      },
      {
        code: "TD-264",
        cote: "DCF",
        nom: "Document appartenant spécialement à la Direction de la Comptabilité et des Finances",
      },
      {
        code: "TD-265",
        cote: "DE",
        nom: "Document appartenant spécialement à la Direction de l'Exploitation",
      },
      {
        code: "TD-266",
        cote: "DDSI",
        nom: "Document appartenant spécialement à la Direction de la Digitalisation et des Systèmes d'Information",
      },
      {
        code: "TD-267",
        cote: "DCP",
        nom: "Document appartenant spécialement à la Direction des Contrôles Permanents",
      },
      {
        code: "TD-268",
        cote: "DGR",
        nom: "Document appartenant spécialement à la Direction de la Gestion des Risques",
      },
      {
        code: "TD-269",
        cote: "DAI",
        nom: "Document appartenant spécialement à la Direction de l'Audit Interne",
      },
      {
        code: "TD-270",
        cote: "SYND",
        nom: "Document appartenant spécialement au syndicat et associations professionnelles",
      },
      {
        code: "TD-271",
        cote: "AO",
        nom: "Actes officiels (Loi, Ordonnance, Décret, Traités, Circulaire, Instruction, Convention, Registres des actes officiels, etc.)",
      },
      {
        code: "TD-272",
        cote: "AG/CA",
        nom: "Document de l'Assemblée Générale et du Conseil d'Administration",
      },
      {
        code: "TD-273",
        cote: "DI",
        nom: "Documentation (ensemble de monographies, de littérature grise, journaux, magazines, iconographies- photo album, audiovisuel, etc.) acquise ou rédigée par l'institution",
      },
      {
        code: "TD-274",
        cote: "ORG",
        nom: "Manuel de procédures, politiques, statut, règlement intérieur, convention collective etc.",
      },
      { code: "TD-275", cote: "REG", nom: "Registres de présence" },
    ];

    let typesCrees = 0;
    let typesExistants = 0;

    for (const data of typeDocumentsData) {
      const [typeDoc, created] = await db.TypeDocument.findOrCreate({
        where: { code: data.code },
        defaults: {
          code: data.code,
          cote: data.cote,
          nom: data.nom,
          entitee_un_id: null,
          entitee_deux_id: null,
          entitee_trois_id: null,
        },
        transaction,
      });

      if (created) {
        typesCrees++;
        console.log(
          `   ✅ Créé: ${data.code} - ${data.nom.substring(0, 60)}${data.nom.length > 60 ? "..." : ""}`,
        );
      } else {
        typesExistants++;
      }
    }

    // ============================================
    // Récapitulatif final
    // ============================================
    console.log("\n📊 Récapitulatif :");
    console.log(`   Types de documents créés: ${typesCrees}`);
    console.log(`   Types de documents existants: ${typesExistants}`);
    console.log(`   Total: ${typesCrees + typesExistants} types de documents`);

    await transaction.commit();
    console.log("\n✨ Script exécuté avec succès !");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Erreur lors de l'exécution du script :", error);
    throw error;
  }
}

// Exécution du script
insertTypeDocuments()
  .then(() => {
    console.log("🏁 Fin du script");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Le script a échoué :", error);
    process.exit(1);
  });
