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
      // SC - Service Comptabilité (TD-001 à TD-016)
      { code: "TD-001", cote: "1 SC", nom: "Fiche initiée/affectée" },
      { code: "TD-002", cote: "2 SC", nom: "Courrier initié/affecté" },
      {
        code: "TD-003",
        cote: "3 SC",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-004",
        cote: "4 SC",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-005",
        cote: "5 SC",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-006",
        cote: "6 SC",
        nom: "Document de synthèse et d'analyse du commissariat aux comptes",
      },
      { code: "TD-007", cote: "7 SC", nom: "État de rapprochement guichet" },
      {
        code: "TD-008",
        cote: "8 SC",
        nom: "État de rapprochement bancaire Siège",
      },
      {
        code: "TD-009",
        cote: "9 SC",
        nom: "État de rapprochement Comptabilité - Informatique",
      },
      {
        code: "TD-010",
        cote: "10 SC",
        nom: "État de rapprochement ligne de crédit et fonctionnement (Agences)",
      },
      { code: "TD-011", cote: "11 SC", nom: "État de rapprochement Épargne" },
      { code: "TD-012", cote: "12 SC", nom: "Pièce de Caisse Menues Dépenses" },
      { code: "TD-013", cote: "13 SC", nom: "Note sur états financiers" },
      {
        code: "TD-014",
        cote: "14 SC",
        nom: "Dossier de déclarations fiscales et sociales (fiscalité)",
      },
      {
        code: "TD-015",
        cote: "15 SC",
        nom: "Dossier de paiements des fournisseurs et autres prestataires",
      },
      { code: "TD-016", cote: "16 SC", nom: "Grand-livre et balance" },

      // SFT - Service Finances et Trésorerie (TD-017 à TD-035)
      { code: "TD-017", cote: "1 SFT", nom: "Fiche initiée/affectée" },
      { code: "TD-018", cote: "2 SFT", nom: "Courrier initié/affecté" },
      {
        code: "TD-019",
        cote: "3 SFT",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-020",
        cote: "4 SFT",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-021",
        cote: "5 SFT",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-022",
        cote: "6 SFT",
        nom: "Document de synthèse et d'analyse financier",
      },
      {
        code: "TD-023",
        cote: "7 SFT",
        nom: "Document de synthèse et d'analyse point journalier de la trésorerie",
      },
      {
        code: "TD-024",
        cote: "8 SFT",
        nom: "Convention (de crédit, de nantissement, de DAT, etc.)",
      },
      { code: "TD-025", cote: "9 SFT", nom: "Indicateurs périodiques" },
      { code: "TD-026", cote: "10 SFT", nom: "Ordre de virement" },
      { code: "TD-027", cote: "11 SFT", nom: "Avis de crédit" },
      { code: "TD-028", cote: "12 SFT", nom: "État financier" },
      { code: "TD-029", cote: "13 SFT", nom: "État de paiement" },
      { code: "TD-030", cote: "14 SFT", nom: "Relevé de compte bancaire" },
      { code: "TD-031", cote: "15 SFT", nom: "Ordre d'émission de chèque" },
      {
        code: "TD-032",
        cote: "16 SFT",
        nom: "Talon de chèque, souche, carnet et affecté manuel",
      },
      { code: "TD-033", cote: "17 SFT", nom: "Fiscalité" },
      { code: "TD-034", cote: "18 SFT", nom: "Salaire" },
      { code: "TD-035", cote: "19 SFT", nom: "Fiche de paie" },

      // PMG - Patrimoine et Logistique (TD-036 à TD-055)
      { code: "TD-036", cote: "1 PMG", nom: "Fiche initiée/affectée" },
      { code: "TD-037", cote: "2 PMG", nom: "Courrier initié/affecté" },
      {
        code: "TD-038",
        cote: "3 PMG",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-039",
        cote: "4 PMG",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-040",
        cote: "5 PMG",
        nom: "Document de synthèse et d'analyse annuel",
      },
      { code: "TD-041", cote: "6 PMG", nom: "Ordre de mission" },
      {
        code: "TD-042",
        cote: "7 PMG",
        nom: "Terme de Référence de mission (TDR)",
      },
      { code: "TD-043", cote: "8 PMG", nom: "Contrat" },
      { code: "TD-044", cote: "9 PMG", nom: "bons de réception (souche)" },
      { code: "TD-045", cote: "10 PMG", nom: "Bons de commande (souche)" },
      {
        code: "TD-046",
        cote: "11 PMG",
        nom: "Demande d'approvisionnement (souche)",
      },
      {
        code: "TD-047",
        cote: "12 PMG",
        nom: "Carnet de demande de fournitures",
      },
      { code: "TD-048", cote: "13 PMG", nom: "Procès-verbal de réception" },
      { code: "TD-049", cote: "14 PMG", nom: "Dossier d'incorporation" },
      { code: "TD-050", cote: "15 PMG", nom: "Bordereau de livraison" },
      {
        code: "TD-051",
        cote: "16 PMG",
        nom: "Fiche de sortie des fournitures",
      },
      {
        code: "TD-052",
        cote: "17 PMG",
        nom: "Fiche de mise à disposition des immobilisations",
      },
      {
        code: "TD-053",
        cote: "18 PMG",
        nom: "Fiche de transfert des immobilisations",
      },
      {
        code: "TD-054",
        cote: "19 PMG",
        nom: "Fiche d'inventaire des biens mobiliers",
      },
      {
        code: "TD-055",
        cote: "20 PMG",
        nom: "Fiche de signalisation des pannes",
      },

      // SRH - Service Ressources Humaines (TD-056 à TD-077)
      { code: "TD-056", cote: "1 SRH", nom: "Fiche initiée/affectée" },
      { code: "TD-057", cote: "2 SRH", nom: "Courrier initié/affecté" },
      {
        code: "TD-058",
        cote: "3 SRH",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-059",
        cote: "4 SRH",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-060",
        cote: "5 SRH",
        nom: "Document de synthèse et d'analyse annuel",
      },
      { code: "TD-061", cote: "6 SRH", nom: "Procès-verbaux" },
      { code: "TD-062", cote: "7 SRH", nom: "Compte rendu" },
      { code: "TD-063", cote: "8 SRH", nom: "Rapport de passation de service" },
      { code: "TD-064", cote: "9 SRH", nom: "Fiche de poste" },
      { code: "TD-065", cote: "10 SRH", nom: "Fiche d'évaluation" },
      { code: "TD-066", cote: "11 SRH", nom: "Demande de stage / Emploi" },
      { code: "TD-067", cote: "12 SRH", nom: "Autorisation de stage" },
      { code: "TD-068", cote: "13 SRH", nom: "Attestation de stage" },
      { code: "TD-069", cote: "14 SRH", nom: "Attestation de travail" },
      { code: "TD-070", cote: "15 SRH", nom: "Certificat de travail" },
      { code: "TD-071", cote: "16 SRH", nom: "Sécurité sociale" },
      { code: "TD-072", cote: "17 SRH", nom: "Formation du personnel" },
      { code: "TD-073", cote: "18 SRH", nom: "Dossier du personnel inactif" },
      { code: "TD-074", cote: "19 SRH", nom: "Assurance" },
      { code: "TD-075", cote: "20 SRH", nom: "Bordereau de transmission" },
      {
        code: "TD-076",
        cote: "21 SRH",
        nom: "Dossiers des stagiaires (académique et professionnel)",
      },
      { code: "TD-077", cote: "22 SRH", nom: "Dossiers de recrutement" },

      // SB - Service Budget (TD-078 à TD-087)
      { code: "TD-078", cote: "1 SB", nom: "Fiche initiée/affectée" },
      { code: "TD-079", cote: "2 SB", nom: "Courrier initié/affecté" },
      {
        code: "TD-080",
        cote: "3 SB",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-081",
        cote: "4 SB",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-082",
        cote: "5 SB",
        nom: "Document de synthèse et d'analyse annuel d'exécution du budget et du PTA",
      },
      {
        code: "TD-083",
        cote: "6 SB",
        nom: "Plan de travail annuel et Budget général de PADME S.A.",
      },
      {
        code: "TD-084",
        cote: "7 SB",
        nom: "Tableau de bord des indicateurs et données significatives de gestion sur plusieurs années",
      },
      {
        code: "TD-085",
        cote: "8 SB",
        nom: "Relevé de décision de réallocation budgétaire",
      },
      {
        code: "TD-086",
        cote: "9 SB",
        nom: "Relevé de décision d'approbation du budget par le Conseil d'Administration",
      },
      {
        code: "TD-087",
        cote: "10 SB",
        nom: "Plan stratégique et plan d'affaires",
      },

      // SAA - Service Archives et Administration (TD-088 à TD-108)
      { code: "TD-088", cote: "1 SAA", nom: "Fiche initiée/affectée/reçue" },
      {
        code: "TD-089",
        cote: "2 SAA",
        nom: "Courrier initié/affecté/départ/arrivée",
      },
      {
        code: "TD-090",
        cote: "3 SAA",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-091",
        cote: "4 SAA",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-092",
        cote: "5 SAA",
        nom: "Document de synthèse et d'analyse annuel",
      },
      { code: "TD-093", cote: "6 SAA", nom: "Compte rendu" },
      { code: "TD-094", cote: "7 SAA", nom: "Procès-verbal mensuel" },
      { code: "TD-095", cote: "8 SAA", nom: "Procès-verbal trimestriel" },
      { code: "TD-096", cote: "9 SAA", nom: "Procès-verbal annuel" },
      { code: "TD-097", cote: "10 SAA", nom: "Notes de Service" },
      { code: "TD-098", cote: "11 SAA", nom: "Notes d'information" },
      { code: "TD-099", cote: "12 SAA", nom: "Décision" },
      { code: "TD-100", cote: "13 SAA", nom: "Communiqué" },
      { code: "TD-101", cote: "14 SAA", nom: "Bordereau de transmission" },
      {
        code: "TD-102",
        cote: "15 SAA",
        nom: "Registre de courrier Départ/Arrivée et registre des contrats des prestataires",
      },
      { code: "TD-103", cote: "16 SAA", nom: "Outils de gestion des archives" },
      { code: "TD-104", cote: "17 SAA", nom: "Fiche typologique de documents" },
      { code: "TD-105", cote: "18 SAA", nom: "Registre de communication" },
      { code: "TD-106", cote: "19 SAA", nom: "Bordereau de versement" },
      { code: "TD-107", cote: "20 SAA", nom: "Fiche de prêt de document" },
      {
        code: "TD-108",
        cote: "21 SAA",
        nom: "Documents relatifs aux travaux de destruction des archives",
      },

      // SMC - Service Marketing et Communication (TD-109 à TD-130)
      { code: "TD-109", cote: "1 SMC", nom: "Fiche initiée/affectée" },
      { code: "TD-110", cote: "2 SMC", nom: "Courrier initié/affecté" },
      {
        code: "TD-111",
        cote: "3 SMC",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-112",
        cote: "4 SMC",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-113",
        cote: "5 SMC",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-114",
        cote: "6 SMC",
        nom: "Document de synthèse et d'analyse de mission",
      },
      {
        code: "TD-115",
        cote: "7 SMC",
        nom: "Document de synthèse et d'analyse Call Center",
      },
      {
        code: "TD-116",
        cote: "8 SMC",
        nom: "Document de synthèse et d'analyse traitement des plaintes",
      },
      {
        code: "TD-117",
        cote: "9 SMC",
        nom: "Document de synthèse et d'analyse étude de marché",
      },
      {
        code: "TD-118",
        cote: "10 SMC",
        nom: "Document de synthèse et d'analyse étude d'ouvertures des points de services",
      },
      {
        code: "TD-119",
        cote: "11 SMC",
        nom: "Document de synthèse et d'analyse satisfaction client",
      },
      {
        code: "TD-120",
        cote: "12 SMC",
        nom: "Document de synthèse et d'analyse satisfaction du personnel",
      },
      { code: "TD-121", cote: "13 SMC", nom: "Questionnaires" },
      {
        code: "TD-122",
        cote: "14 SMC",
        nom: "Guide de discussion pour FOCUS Group ou autres",
      },
      { code: "TD-123", cote: "15 SMC", nom: "Carte de vœux" },
      { code: "TD-124", cote: "16 SMC", nom: "Carte de visite" },
      { code: "TD-125", cote: "17 SMC", nom: "Carte d'invitation" },
      {
        code: "TD-126",
        cote: "18 SMC",
        nom: "Avis et propositions sur dossier de sponsoring",
      },
      { code: "TD-127", cote: "19 SMC", nom: "Encarts publicitaires" },
      { code: "TD-128", cote: "20 SMC", nom: "Flyers-prospectus" },
      {
        code: "TD-129",
        cote: "21 SMC",
        nom: "Prémaquettes et maquettes de supports de communication",
      },
      {
        code: "TD-130",
        cote: "22 SMC",
        nom: "Cérémonie officielle et activité spéciale",
      },

      // SE - Service Épargne (TD-131 à TD-137)
      { code: "TD-131", cote: "1 SE", nom: "Fiche initiée/affectée" },
      { code: "TD-132", cote: "2 SE", nom: "Courrier initié/affecté" },
      {
        code: "TD-133",
        cote: "3 SE",
        nom: "Document de synthèse et d'analyse des activités d'épargne",
      },
      {
        code: "TD-134",
        cote: "4 SE",
        nom: "Document de synthèse et d'analyse journalier de réalisation de tontine des Opérationnels Polyvalents",
      },
      {
        code: "TD-135",
        cote: "5 SE",
        nom: "Document de synthèse et d'analyse point hebdomadaire des opérations d'épargne",
      },
      {
        code: "TD-136",
        cote: "6 SE",
        nom: "Registre de gestion des cartes NFC",
      },
      {
        code: "TD-137",
        cote: "7 SE",
        nom: "Registre de gestion des comptes clients",
      },

      // SES - Service Études et Statistiques (TD-138 à TD-153)
      { code: "TD-138", cote: "1 SES", nom: "Fiche initiée/affectée" },
      { code: "TD-139", cote: "2 SES", nom: "Courrier initié/affecté" },
      {
        code: "TD-140",
        cote: "3 SES",
        nom: "Document de synthèse et d'analyse mensuel",
      },
      {
        code: "TD-141",
        cote: "4 SES",
        nom: "Document de synthèse et d'analyse trimestriel",
      },
      {
        code: "TD-142",
        cote: "5 SES",
        nom: "Document de synthèse et d'analyse annuel",
      },
      {
        code: "TD-143",
        cote: "6 SES",
        nom: "Document de synthèse et d'analyse de crédit",
      },
      {
        code: "TD-144",
        cote: "7 SES",
        nom: "Document de synthèse et d'analyse d'épargne",
      },
      {
        code: "TD-145",
        cote: "8 SES",
        nom: "Document de synthèse et d'analyse étude de marché",
      },
      {
        code: "TD-146",
        cote: "9 SES",
        nom: "Document de synthèse et d'analyse de la concurrence",
      },
      {
        code: "TD-147",
        cote: "10 SES",
        nom: "Document de synthèse et d'analyse étude d'ouverture des points de services",
      },
      {
        code: "TD-148",
        cote: "11 SES",
        nom: "Document de synthèse et d'analyse satisfaction des clients",
      },
      {
        code: "TD-149",
        cote: "12 SES",
        nom: "Document de synthèse et d'analyse satisfaction du personnel",
      },
      {
        code: "TD-150",
        cote: "13 SES",
        nom: "Document de synthèse et d'analyse enquête",
      },
      {
        code: "TD-151",
        cote: "14 SES",
        nom: "Document de synthèse et d'analyse synthèse d'Informations",
      },
      {
        code: "TD-152",
        cote: "15 SES",
        nom: "Données statistiques, bulletin des chiffres, fichier des gros débiteurs",
      },
      { code: "TD-153", cote: "16 SES", nom: "Indicateurs périodiques" },

      // SCR - Service Crédit et Recouvrement (TD-154 à TD-160)
      { code: "TD-154", cote: "1 SCR", nom: "Fiche initiée/affectée" },
      { code: "TD-155", cote: "2 SCR", nom: "Courrier initié/affecté" },
      {
        code: "TD-156",
        cote: "3 SCR",
        nom: "Document de synthèse et d'analyse périodique d'activité",
      },
      {
        code: "TD-157",
        cote: "4 SCR",
        nom: "Document de synthèse et d'analyse périodique de recouvrement",
      },
      {
        code: "TD-158",
        cote: "5 SCR",
        nom: "Document de synthèse et d'analyse périodique de mission",
      },
      { code: "TD-159", cote: "6 SCR", nom: "Pièces de caisse" },
      {
        code: "TD-160",
        cote: "7 SCR",
        nom: "Dossier de partenariat (MCM ALAFIA, FNDA, ARCH, PDPIM, etc.)",
      },

      // SPQ - Service Productivité et Qualité (TD-161 à TD-168)
      { code: "TD-161", cote: "1 SPQ", nom: "Fiche initiée/affectée" },
      { code: "TD-162", cote: "2 SPQ", nom: "Courrier initié/affecté" },
      {
        code: "TD-163",
        cote: "3 SPQ",
        nom: "Document de synthèse et d'analyse mensuel de productivité et rentabilité des entités et des agents",
      },
      {
        code: "TD-164",
        cote: "4 SPQ",
        nom: "Document de synthèse et d'analyse trimestriel de productivité et rentabilité des entités et des agents",
      },
      {
        code: "TD-165",
        cote: "5 SPQ",
        nom: "Document de synthèse et d'analyse annuel de productivité et rentabilité des entités et des agents",
      },
      {
        code: "TD-166",
        cote: "6 SPQ",
        nom: "Document de synthèse et d'analyse de contrôle de qualité",
      },
      {
        code: "TD-167",
        cote: "7 SPQ",
        nom: "Document de synthèse et d'analyse sur la gestion des réclamations",
      },
      {
        code: "TD-168",
        cote: "8 SPQ",
        nom: "Certification de produit et/ou services",
      },

      // SR - Service Risques (TD-169 à TD-175)
      { code: "TD-169", cote: "1 SR", nom: "Fiche initiée/affectée" },
      { code: "TD-170", cote: "2 SR", nom: "Courrier initié/affecté" },
      {
        code: "TD-171",
        cote: "3 SR",
        nom: "Document de synthèse et d'analyse mensuel d'activités",
      },
      {
        code: "TD-172",
        cote: "4 SR",
        nom: "Document de synthèse et d'analyse trimestriel d'activités",
      },
      {
        code: "TD-173",
        cote: "5 SR",
        nom: "Document de synthèse et d'analyse annuel d'activités",
      },
      {
        code: "TD-174",
        cote: "6 SR",
        nom: "Document de synthèse et d'analyse de déclaration à la CENTIF",
      },
      {
        code: "TD-175",
        cote: "7 SR",
        nom: "Document de synthèse et d'analyse circonstancié",
      },

      // SJ - Service Juridique (TD-176 à TD-190)
      { code: "TD-176", cote: "1 SJ", nom: "Fiche initiée/affectée" },
      { code: "TD-177", cote: "2 SJ", nom: "Courrier initié/affecté" },
      {
        code: "TD-178",
        cote: "3 SJ",
        nom: "Document de synthèse et d'analyse mensuel d'activités",
      },
      {
        code: "TD-179",
        cote: "4 SJ",
        nom: "Document de synthèse et d'analyse trimestriel d'activités",
      },
      {
        code: "TD-180",
        cote: "5 SJ",
        nom: "Document de synthèse et d'analyse annuel d'activités",
      },
      { code: "TD-181", cote: "6 SJ", nom: "Contrat de Dépôt à Terme (DAT)" },
      { code: "TD-182", cote: "7 SJ", nom: "Contrat de partenariat" },
      { code: "TD-183", cote: "8 SJ", nom: "Contrat de prestation de service" },
      { code: "TD-184", cote: "9 SJ", nom: "Contrat de bail" },
      { code: "TD-185", cote: "10 SJ", nom: "Dossier de contentieux client" },
      {
        code: "TD-186",
        cote: "11 SJ",
        nom: "Dossier de contentieux personnel prestataire",
      },
      { code: "TD-187", cote: "12 SJ", nom: "Dossier de prêt au personnel" },
      {
        code: "TD-188",
        cote: "13 SJ",
        nom: "Dossier de client concernant sa garantie (demande de copie, substitution, etc.)",
      },
      { code: "TD-189", cote: "14 SJ", nom: "Convention de garantie réelle" },
      {
        code: "TD-190",
        cote: "15 SJ",
        nom: "Avis juridique / Acte de cautionnement",
      },

      // FCO - Formation et Communication (TD-191 à TD-196)
      { code: "TD-191", cote: "1 FCO", nom: "Fiche initiée/affectée" },
      { code: "TD-192", cote: "2 FCO", nom: "Courrier initié/affecté" },
      {
        code: "TD-193",
        cote: "3 FCO",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-194",
        cote: "4 FCO",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-195",
        cote: "5 FCO",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-196",
        cote: "6 FCO",
        nom: "Modules et autres documents entrant dans le cadre de la formation du personnel",
      },

      // AUD - Audit (TD-197 à TD-202)
      { code: "TD-197", cote: "1 AUD", nom: "Fiche initiée/affectée" },
      { code: "TD-198", cote: "2 AUD", nom: "Courrier initié/affecté" },
      {
        code: "TD-199",
        cote: "3 AUD",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-200",
        cote: "4 AUD",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-201",
        cote: "5 AUD",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-202",
        cote: "6 AUD",
        nom: "Document de synthèse et d'analyse de contrôle",
      },

      // INSP - Inspection (TD-203 à TD-212)
      { code: "TD-203", cote: "1 INSP", nom: "Fiche initiée/affectée" },
      { code: "TD-204", cote: "2 INSP", nom: "Courrier initié/affecté" },
      {
        code: "TD-205",
        cote: "3 INSP",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-206",
        cote: "4 INSP",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-207",
        cote: "5 INSP",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-208",
        cote: "6 INSP",
        nom: "Document de synthèse et d'analyse de mission élargie",
      },
      {
        code: "TD-209",
        cote: "7 INSP",
        nom: "Document de synthèse et d'analyse de mission d'investigations",
      },
      {
        code: "TD-210",
        cote: "8 INSP",
        nom: "Document de synthèse et d'analyse d'audit de portefeuilles",
      },
      {
        code: "TD-211",
        cote: "9 INSP",
        nom: "Document de synthèse et d'analyse de contrôle global",
      },
      {
        code: "TD-212",
        cote: "10 INSP",
        nom: "Synthèse d'informations sur les opérations et synthèse de reporting périodique (CB, CA)",
      },

      // SSI - Sécurité des Systèmes d'Information (TD-213 à TD-217)
      { code: "TD-213", cote: "1 SSI", nom: "Fiche initiée/affectée" },
      { code: "TD-214", cote: "2 SSI", nom: "Courrier initié/affecté" },
      {
        code: "TD-215",
        cote: "3 SSI",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-216",
        cote: "4 SSI",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-217",
        cote: "5 SSI",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },

      // SAP - Suivi des Activités et Performance (TD-218 à TD-226)
      { code: "TD-218", cote: "1 SAP", nom: "Fiche initiée/affectée" },
      { code: "TD-219", cote: "2 SAP", nom: "Courrier initié/affecté" },
      {
        code: "TD-220",
        cote: "3 SAP",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-221",
        cote: "4 SAP",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-222",
        cote: "5 SAP",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-223",
        cote: "6 SAP",
        nom: "Document de synthèse et d'analyse d'évaluation",
      },
      {
        code: "TD-224",
        cote: "7 SAP",
        nom: "Document de synthèse et d'analyse de mission",
      },
      { code: "TD-225", cote: "8 SAP", nom: "Procès-verbal de réception" },
      { code: "TD-226", cote: "9 SAP", nom: "Manuel de formation" },

      // SIR - Suivi des Indicateurs et Reporting (TD-227 à TD-235)
      { code: "TD-227", cote: "1 SIR", nom: "Fiche initiée/affectée" },
      { code: "TD-228", cote: "2 SIR", nom: "Courrier initié/affecté" },
      {
        code: "TD-229",
        cote: "3 SIR",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-230",
        cote: "4 SIR",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-231",
        cote: "5 SIR",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-232",
        cote: "6 SIR",
        nom: "Document de synthèse et d'analyse d'évaluation",
      },
      {
        code: "TD-233",
        cote: "7 SIR",
        nom: "Document de synthèse et d'analyse de mission",
      },
      { code: "TD-234", cote: "8 SIR", nom: "Procès-verbal de réception" },
      { code: "TD-235", cote: "9 SIR", nom: "Manuel de formation" },

      // ESU - Études et Suivi (TD-236 à TD-245)
      { code: "TD-236", cote: "1 ESU", nom: "Fiche initiée/affectée" },
      { code: "TD-237", cote: "2 ESU", nom: "Courrier initié/affecté" },
      {
        code: "TD-238",
        cote: "3 ESU",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-239",
        cote: "4 ESU",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-240",
        cote: "5 ESU",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-241",
        cote: "6 ESU",
        nom: "Document de synthèse et d'analyse d'évaluation",
      },
      {
        code: "TD-242",
        cote: "7 ESU",
        nom: "Document de synthèse et d'analyse de mission",
      },
      { code: "TD-243", cote: "8 ESU", nom: "Procès-verbal de réception" },
      { code: "TD-244", cote: "9 ESU", nom: "Manuel de formation" },
      { code: "TD-245", cote: "10 ESU", nom: "Synthèse d'information" },

      // RAM - Régie des Achats et Marchés (TD-246 à TD-258)
      {
        code: "TD-246",
        cote: "1 RAM",
        nom: "Dossier de marché (Avis d'appel à candidature, PV d'ouverture, PV d'attribution provisoire, Rapport d'évaluation, PV de négociation, Avis d'attribution définitive, Contrat de marché pour signature, Contrat de marché pour enregistrement, Demande/Requête adressée à la DNCMP/ARMP, Offres techniques financières et administratives, etc.)",
      },
      { code: "TD-247", cote: "2 RAM", nom: "Fiche initiée/affectée" },
      { code: "TD-248", cote: "3 RAM", nom: "Courrier initié/affecté" },
      {
        code: "TD-249",
        cote: "4 RAM",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-250",
        cote: "5 RAM",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-251",
        cote: "6 RAM",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },
      {
        code: "TD-252",
        cote: "7 RAM",
        nom: "Document de synthèse et d'analyse d'évaluation",
      },
      {
        code: "TD-253",
        cote: "8 RAM",
        nom: "Document de synthèse et d'analyse de mission",
      },
      { code: "TD-254", cote: "9 RAM", nom: "Procès-verbal" },
      {
        code: "TD-255",
        cote: "10 RAM",
        nom: "Plan et avis général de passation des Marchés Publics",
      },
      {
        code: "TD-256",
        cote: "11 RAM",
        nom: "Document de synthèse et d'analyse d'activité trimestrielle",
      },
      {
        code: "TD-257",
        cote: "12 RAM",
        nom: "PV de réception technique, provisoire et définitive",
      },
      { code: "TD-258", cote: "13 RAM", nom: "Contrat et Avenant" },

      // CC - Contrôle Conformité (TD-259 à TD-263)
      { code: "TD-259", cote: "1 CC", nom: "Fiche initiée/affectée" },
      { code: "TD-260", cote: "2 CC", nom: "Courrier initié/affecté" },
      {
        code: "TD-261",
        cote: "3 CC",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-262",
        cote: "4 CC",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-263",
        cote: "5 CC",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },

      // CPDT - Contrôle Permanent Direction Technique (TD-264 à TD-268)
      { code: "TD-264", cote: "1 CPDT", nom: "Fiche initiée/affectée" },
      { code: "TD-265", cote: "2 CPDT", nom: "Courrier initié/affecté" },
      {
        code: "TD-266",
        cote: "3 CPDT",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-267",
        cote: "4 CPDT",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-268",
        cote: "5 CPDT",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },

      // CPA - Contrôle Permanent Agences (TD-269 à TD-273)
      { code: "TD-269", cote: "1 CPA", nom: "Fiche initiée/affectée" },
      { code: "TD-270", cote: "2 CPA", nom: "Courrier initié/affecté" },
      {
        code: "TD-271",
        cote: "3 CPA",
        nom: "Document de synthèse et d'analyse mensuel d'activité",
      },
      {
        code: "TD-272",
        cote: "4 CPA",
        nom: "Document de synthèse et d'analyse trimestriel d'activité",
      },
      {
        code: "TD-273",
        cote: "5 CPA",
        nom: "Document de synthèse et d'analyse annuel d'activité",
      },

      // Documents généraux et transversaux (TD-274 à TD-289)
      {
        code: "TD-274",
        cote: "AO",
        nom: "Actes officiels (Loi, Ordonnance, Décret, Traités, Circulaire, Instruction, Convention, Registres des actes officiels, etc.)",
      },
      {
        code: "TD-275",
        cote: "AG/CA",
        nom: "Document de l'Assemblée Générale et du Conseil d'Administration",
      },
      {
        code: "TD-276",
        cote: "DI",
        nom: "Documentation (ensemble de monographies, de littérature grise, journaux, magazines, iconographies- photo album, audiovisuel, etc.) acquise ou rédigée par l'institution",
      },
      {
        code: "TD-277",
        cote: "ORG",
        nom: "Manuel de procédures, politiques, statut, règlement intérieur, convention collective etc.",
      },
      { code: "TD-278", cote: "REG", nom: "Registres de présence" },
      {
        code: "TD-279",
        cote: "DG",
        nom: "Document appartenant spécialement à la Direction Générale",
      },
      {
        code: "TD-280",
        cote: "DGA",
        nom: "Document appartenant spécialement à la Direction Générale Adjointe",
      },
      {
        code: "TD-281",
        cote: "SP",
        nom: "Document appartenant spécialement au Secrétaire Particulier",
      },
      {
        code: "TD-282",
        cote: "DAF",
        nom: "Document appartenant spécialement à la Direction de l'Administration et des Finances",
      },
      {
        code: "TD-283",
        cote: "DRH",
        nom: "Document appartenant spécialement à la Direction des Ressources Humaines",
      },
      {
        code: "TD-284",
        cote: "DSI",
        nom: "Document appartenant spécialement à la Direction des Systèmes d'Information",
      },
      {
        code: "TD-285",
        cote: "DIA",
        nom: "Document appartenant spécialement à la Direction d'Inspection et de l'Audit",
      },
      {
        code: "TD-286",
        cote: "DE",
        nom: "Document appartenant spécialement au Direction de l'Exploitation",
      },
      {
        code: "TD-287",
        cote: "DRE",
        nom: "Document appartenant spécialement à la Direction des Risques et Engagements",
      },
      {
        code: "TD-288",
        cote: "DCP",
        nom: "Document appartenant spécialement à la Direction des Contrôles Permanents",
      },
      {
        code: "TD-289",
        cote: "SYND",
        nom: "Document appartenant spécialement au syndicat et associations professionnelles",
      },
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
