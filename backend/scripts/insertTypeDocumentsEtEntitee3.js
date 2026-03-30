// scripts/insertTypeDocuments.js
const db = require("../models");

async function insertTypeDocuments() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log("🚀 Début de l'insertion des types de documents...\n");

    // ============================================
    // Récupération des IDs des entités (directions et services)
    // ============================================

    // Récupération des directions (entitee_un)
    const directions = {};
    const allDirections = await db.EntiteeUn.findAll({ transaction });
    allDirections.forEach((dir) => {
      directions[dir.code] = dir.id;
      directions[dir.libelle] = dir.id;
    });

    // Récupération des services (entitee_deux) avec leur direction parente
    const services = {};
    const allServices = await db.EntiteeDeux.findAll({
      include: [{ model: db.EntiteeUn, as: "entitee_un" }],
      transaction,
    });
    allServices.forEach((service) => {
      services[service.code] = {
        id: service.id,
        entitee_un_id: service.entitee_un_id,
        libelle: service.libelle,
      };
      services[service.libelle] = {
        id: service.id,
        entitee_un_id: service.entitee_un_id,
        libelle: service.libelle,
      };
    });

    console.log(
      "📋 Directions trouvées :",
      Object.keys(directions).filter((k) => k.startsWith("DIR")).length,
    );
    console.log(
      "📋 Services trouvés :",
      Object.keys(services).filter((k) => k.startsWith("SER")).length,
    );
    console.log("");

    // ============================================
    // Fonction utilitaire pour obtenir les IDs d'entité
    // ============================================
    function getEntityIds(serviceName) {
      const service = services[serviceName];
      if (!service) {
        console.warn(`⚠️ Service non trouvé: ${serviceName}`);
        return { entitee_un_id: null, entitee_deux_id: null };
      }
      return {
        entitee_deux_id: service.id,
        entitee_un_id: service.entitee_un_id,
      };
    }

    // ============================================
    // Données des types de documents avec associations
    // ============================================
    const typeDocumentsData = [
      // ============================================
      // SERVICE SECRÉTARIAT ADMINISTRATIF (SER-017)
      // ============================================
      {
        code: "TD-001",
        cote: "1 SA",
        nom: "Fiche initiée/affectée/reçue",
        service: "SER-017",
      },
      {
        code: "TD-002",
        cote: "2 SA",
        nom: "Courrier initié/affecté/départ/arrivée",
        service: "SER-017",
      },
      {
        code: "TD-003",
        cote: "3 SA",
        nom: "Document de synthèse et d'analyse (Document de synthèse et d'analyse/Compte rendu/Procès-verbal mensuel, trimestriel, annuel, etc.)",
        service: "SER-017",
      },
      {
        code: "TD-004",
        cote: "4 SA",
        nom: "Notes de Service",
        service: "SER-017",
      },
      {
        code: "TD-005",
        cote: "5 SA",
        nom: "Notes d'information",
        service: "SER-017",
      },
      { code: "TD-006", cote: "6 SA", nom: "Décision", service: "SER-017" },
      { code: "TD-007", cote: "7 SA", nom: "Communiqué", service: "SER-017" },
      {
        code: "TD-008",
        cote: "8 SA",
        nom: "Registre de courrier Départ/Arrivée et registre des contrats des prestataires",
        service: "SER-017",
      },
      {
        code: "TD-009",
        cote: "9 SA",
        nom: "Bordereau de transmission",
        service: "SER-017",
      },

      // ============================================
      // SERVICE PATRIMOINE ET LOGISTIQUE (SER-018)
      // ============================================
      {
        code: "TD-010",
        cote: "1 PL",
        nom: "Fiche initiée/affectée",
        service: "SER-018",
      },
      {
        code: "TD-011",
        cote: "2 PL",
        nom: "Courrier initié/affecté",
        service: "SER-018",
      },
      {
        code: "TD-012",
        cote: "3 PL",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel, etc.)",
        service: "SER-018",
      },
      {
        code: "TD-013",
        cote: "4 PL",
        nom: "Ordre de mission",
        service: "SER-018",
      },
      {
        code: "TD-014",
        cote: "5 PL",
        nom: "Terme de Référence de mission (TDR)",
        service: "SER-018",
      },
      { code: "TD-015", cote: "6 PL", nom: "Contrat", service: "SER-018" },
      {
        code: "TD-016",
        cote: "7 PL",
        nom: "Bons de réception (souche)",
        service: "SER-018",
      },
      {
        code: "TD-017",
        cote: "8 PL",
        nom: "Bons de commande (souche)",
        service: "SER-018",
      },
      {
        code: "TD-018",
        cote: "9 PL",
        nom: "Demande d'approvisionnement (souche)",
        service: "SER-018",
      },
      {
        code: "TD-019",
        cote: "10 PL",
        nom: "Carnet de demande de fournitures",
        service: "SER-018",
      },
      {
        code: "TD-020",
        cote: "11 PL",
        nom: "Procès-verbal de réception",
        service: "SER-018",
      },
      {
        code: "TD-021",
        cote: "12 PL",
        nom: "Dossier d'incorporation",
        service: "SER-018",
      },
      {
        code: "TD-022",
        cote: "13 PL",
        nom: "Bordereau de livraison",
        service: "SER-018",
      },
      {
        code: "TD-023",
        cote: "14 PL",
        nom: "Fiche (de sortie des fournitures, de mise à disposition des immobilisations, de transfert des immobilisations, d'inventaire des biens mobiliers, de signalisation des pannes, etc.)",
        service: "SER-018",
      },
      {
        code: "TD-024",
        cote: "15 PL",
        nom: "Dossier de marché (Avis d'appel à candidature, PV d'ouverture, PV d'attribution provisoire, Rapport d'évaluation, PV de négociation, Avis d'attribution définitive, Contrat de marché pour signature, Contrat de marché pour enregistrement, Demande/Requête adressée à la DNCMP/ARMP, Offres techniques financières et administratives, etc.)",
        service: "SER-018",
      },
      {
        code: "TD-025",
        cote: "16 PL",
        nom: "Plan et avis général de passation des Marchés Publics",
        service: "SER-018",
      },
      {
        code: "TD-026",
        cote: "17 PL",
        nom: "PV de réception technique, provisoire et définitive",
        service: "SER-018",
      },
      {
        code: "TD-027",
        cote: "18 PL",
        nom: "Contrat et Avenant",
        service: "SER-018",
      },

      // ============================================
      // SERVICE ARCHIVES (SER-019)
      // ============================================
      {
        code: "TD-028",
        cote: "1 ARCH",
        nom: "Fiche initiée/affectée/reçue",
        service: "SER-019",
      },
      {
        code: "TD-029",
        cote: "2 ARCH",
        nom: "Courrier initié/affecté/départ/arrivée",
        service: "SER-019",
      },
      {
        code: "TD-030",
        cote: "3 ARCH",
        nom: "Document de synthèse et d'analyse (Document de synthèse et d'analyse/Compte rendu/Rapport mensuel, trimestriel, annuel, etc.)",
        service: "SER-019",
      },
      {
        code: "TD-031",
        cote: "4 ARCH",
        nom: "Outils de gestion des archives",
        service: "SER-019",
      },
      {
        code: "TD-032",
        cote: "5 ARCH",
        nom: "Fiche typologique de documents",
        service: "SER-019",
      },
      {
        code: "TD-033",
        cote: "6 ARCH",
        nom: "Registre de communication",
        service: "SER-019",
      },
      {
        code: "TD-034",
        cote: "7 ARCH",
        nom: "Bordereau de versement",
        service: "SER-019",
      },
      {
        code: "TD-035",
        cote: "8 ARCH",
        nom: "Fiche de prêt de document",
        service: "SER-019",
      },
      {
        code: "TD-036",
        cote: "9 ARCH",
        nom: "Ouvrages pédagogiques acquis par la Société",
        service: "SER-019",
      },
      {
        code: "TD-037",
        cote: "10 ARCH",
        nom: "Documents relatifs aux travaux de d'élimination de documents",
        service: "SER-019",
      },

      // ============================================
      // SERVICE ADMINISTRATION DU PERSONNEL ET DES RELATIONS SOCIALES (SER-020)
      // ============================================
      {
        code: "TD-038",
        cote: "1 APRS",
        nom: "Fiche initiée/affectée",
        service: "SER-020",
      },
      {
        code: "TD-039",
        cote: "2 APRS",
        nom: "Courrier initié/affecté",
        service: "SER-020",
      },
      {
        code: "TD-040",
        cote: "3 APRS",
        nom: "Document de synthèse et d'analyse/Procès-verbaux/Compte rendu, rapport (mensuel, trimestriel, annuel, etc.)",
        service: "SER-020",
      },
      {
        code: "TD-041",
        cote: "4 APRS",
        nom: "Fiche de poste",
        service: "SER-020",
      },
      {
        code: "TD-042",
        cote: "5 APRS",
        nom: "Demande de stage / Emploi",
        service: "SER-020",
      },
      {
        code: "TD-043",
        cote: "6 APRS",
        nom: "Autorisation de stage",
        service: "SER-020",
      },
      {
        code: "TD-044",
        cote: "7 APRS",
        nom: "Attestation (de stage, de travail, etc.)/Certificat de travail",
        service: "SER-020",
      },
      {
        code: "TD-045",
        cote: "8 APRS",
        nom: "Sécurité sociale",
        service: "SER-020",
      },
      {
        code: "TD-046",
        cote: "9 APRS",
        nom: "Dossier du personnel inactif",
        service: "SER-020",
      },
      { code: "TD-047", cote: "10 APRS", nom: "Assurance", service: "SER-020" },
      {
        code: "TD-048",
        cote: "11 APRS",
        nom: "Bordereau de transmission",
        service: "SER-020",
      },

      // ============================================
      // SERVICE RECRUTEMENT, GESTION DES PERFORMANCES ET DE LA MOBILITÉ (SER-021)
      // ============================================
      {
        code: "TD-049",
        cote: "1 RGPM",
        nom: "Fiche initiée/affectée",
        service: "SER-021",
      },
      {
        code: "TD-050",
        cote: "2 RGPM",
        nom: "Courrier initié/affecté",
        service: "SER-021",
      },
      {
        code: "TD-051",
        cote: "3 RGPM",
        nom: "Document de synthèse et d'analyse/Procès-verbaux/Compte rendu (mensuel, trimestriel, annuel, etc.) rapport de passation de service et autres rapport",
        service: "SER-021",
      },
      {
        code: "TD-052",
        cote: "4 RGPM",
        nom: "Fiche d'évaluation",
        service: "SER-021",
      },
      {
        code: "TD-053",
        cote: "5 RGPM",
        nom: "Autorisation de stage",
        service: "SER-021",
      },
      {
        code: "TD-054",
        cote: "6 RGPM",
        nom: "Dossiers des stagiaires (académique et professionnel)",
        service: "SER-021",
      },
      {
        code: "TD-055",
        cote: "7 RGPM",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel de productivité et rentabilité des entités et des agents, de contrôle de qualité, sur la gestion des réclamations, etc.)",
        service: "SER-021",
      },
      {
        code: "TD-056",
        cote: "8 RGPM",
        nom: "Certification de produit et/ou services",
        service: "SER-021",
      },

      // ============================================
      // SERVICE FORMATION (SER-022)
      // ============================================
      {
        code: "TD-057",
        cote: "1 SF",
        nom: "Fiche initiée/affectée",
        service: "SER-022",
      },
      {
        code: "TD-058",
        cote: "2 SF",
        nom: "Courrier initié/affecté",
        service: "SER-022",
      },
      {
        code: "TD-059",
        cote: "3 SF",
        nom: "Document de synthèse et d'analyse/Procès-verbaux/Compte rendu, rapport (mensuel, trimestriel, annuel, etc.)",
        service: "SER-022",
      },
      {
        code: "TD-060",
        cote: "4 SF",
        nom: "Formation du personnel/ Modules et autres documents entrant dans le cadre de la formation du personnel",
        service: "SER-022",
      },

      // ============================================
      // SERVICE COMPTABILITÉ (SER-003)
      // ============================================
      {
        code: "TD-061",
        cote: "1 SCo",
        nom: "Fiche initiée/affectée",
        service: "SER-003",
      },
      {
        code: "TD-062",
        cote: "2 SCo",
        nom: "Courrier initié/affecté",
        service: "SER-003",
      },
      {
        code: "TD-063",
        cote: "3 SCo",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel, du commissariat aux comptes, etc.)",
        service: "SER-003",
      },
      {
        code: "TD-064",
        cote: "4 SCo",
        nom: "État de rapprochement guichet",
        service: "SER-003",
      },
      {
        code: "TD-065",
        cote: "5 SCo",
        nom: "État de rapprochement bancaire Siège",
        service: "SER-003",
      },
      {
        code: "TD-066",
        cote: "6 SCo",
        nom: "État de rapprochement Comptabilité - Informatique",
        service: "SER-003",
      },
      {
        code: "TD-067",
        cote: "7 SCo",
        nom: "État de rapprochement ligne de crédit et fonctionnement (Agences)",
        service: "SER-003",
      },
      {
        code: "TD-068",
        cote: "8 SCo",
        nom: "État de rapprochement Épargne",
        service: "SER-003",
      },
      {
        code: "TD-069",
        cote: "9 SCo",
        nom: "Pièce de Caisse Menues Dépenses",
        service: "SER-003",
      },
      {
        code: "TD-070",
        cote: "10 SCo",
        nom: "Note sur états financiers",
        service: "SER-003",
      },
      {
        code: "TD-071",
        cote: "11 SCo",
        nom: "Dossier de déclarations fiscales et sociales (fiscalité)",
        service: "SER-003",
      },
      {
        code: "TD-072",
        cote: "12 SCo",
        nom: "Dossier de paiements des fournisseurs et autres prestataires",
        service: "SER-003",
      },
      {
        code: "TD-073",
        cote: "13 SCo",
        nom: "Grand-livre et balance",
        service: "SER-003",
      },

      // ============================================
      // SERVICE DE LA TRÉSORERIE ET DES FINANCEMENTS (SER-004)
      // ============================================
      {
        code: "TD-074",
        cote: "1 STF",
        nom: "Fiche initiée/affectée",
        service: "SER-004",
      },
      {
        code: "TD-075",
        cote: "2 STF",
        nom: "Courrier initié/affecté",
        service: "SER-004",
      },
      {
        code: "TD-076",
        cote: "3 STF",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel, financier, point journalier de la trésorerie, etc.)",
        service: "SER-004",
      },
      {
        code: "TD-077",
        cote: "4 STF",
        nom: "Convention (de crédit, de nantissement, de DAT, etc.)",
        service: "SER-004",
      },
      {
        code: "TD-078",
        cote: "5 STF",
        nom: "Indicateurs périodiques",
        service: "SER-004",
      },
      {
        code: "TD-079",
        cote: "6 STF",
        nom: "Ordre de virement",
        service: "SER-004",
      },
      {
        code: "TD-080",
        cote: "7 STF",
        nom: "Avis de crédit",
        service: "SER-004",
      },
      {
        code: "TD-081",
        cote: "8 STF",
        nom: "État financier",
        service: "SER-004",
      },
      {
        code: "TD-082",
        cote: "9 STF",
        nom: "État de paiement",
        service: "SER-004",
      },
      {
        code: "TD-083",
        cote: "10 STF",
        nom: "Relevé de compte bancaire",
        service: "SER-004",
      },
      {
        code: "TD-084",
        cote: "11 STF",
        nom: "Ordre d'émission de chèque",
        service: "SER-004",
      },
      {
        code: "TD-085",
        cote: "12 STF",
        nom: "Talon de chèque, souche, carnet et affecté manuel",
        service: "SER-004",
      },
      { code: "TD-086", cote: "13 STF", nom: "Fiscalité", service: "SER-004" },
      { code: "TD-087", cote: "14 STF", nom: "Salaire", service: "SER-004" },
      {
        code: "TD-088",
        cote: "15 STF",
        nom: "Fiche de paie",
        service: "SER-004",
      },

      // ============================================
      // SERVICE BUDGET ET CONTRÔLE DE GESTION (SER-005)
      // ============================================
      {
        code: "TD-089",
        cote: "1 BCG",
        nom: "Fiche initiée/affectée",
        service: "SER-005",
      },
      {
        code: "TD-090",
        cote: "2 BCG",
        nom: "Courrier initié/affecté",
        service: "SER-005",
      },
      {
        code: "TD-091",
        cote: "3 BCG",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel d'exécution du budget et du PTA, etc.)",
        service: "SER-005",
      },
      {
        code: "TD-092",
        cote: "4 BCG",
        nom: "Plan de travail annuel et Budget général de PADME S.A.",
        service: "SER-005",
      },
      {
        code: "TD-093",
        cote: "5 BCG",
        nom: "Tableau de bord des indicateurs et données significatives de gestion sur plusieurs années",
        service: "SER-005",
      },
      {
        code: "TD-094",
        cote: "6 BCG",
        nom: "Relevé de décision (de réallocation budgétaire, d'approbation du budget par le Conseil d'Administration)",
        service: "SER-005",
      },
      {
        code: "TD-095",
        cote: "7 BCG",
        nom: "Plan stratégique et plan d'affaires",
        service: "SER-005",
      },

      // ============================================
      // SERVICE CRÉDIT (SER-006)
      // ============================================
      {
        code: "TD-096",
        cote: "1 SCR",
        nom: "Fiche initiée/affectée",
        service: "SER-006",
      },
      {
        code: "TD-097",
        cote: "2 SCR",
        nom: "Courrier initié/affecté",
        service: "SER-006",
      },
      {
        code: "TD-098",
        cote: "3 SCR",
        nom: "Document de synthèse et d'analyse périodique (d'activité, de recouvrement et de mission)",
        service: "SER-006",
      },
      {
        code: "TD-099",
        cote: "4 SCR",
        nom: "Pièces de caisse",
        service: "SER-006",
      },
      {
        code: "TD-100",
        cote: "5 SCR",
        nom: "Pièces comptables Agences",
        service: "SER-006",
      },
      {
        code: "TD-101",
        cote: "6 SCR",
        nom: "Dossier de partenariat (MCM ALAFIA, FNDA, ARCH, PDPIM, etc.)",
        service: "SER-006",
      },

      // ============================================
      // SERVICE ÉPARGNE ET OPÉRATIONS DIVERSES (SER-007)
      // ============================================
      {
        code: "TD-102",
        cote: "1 EOD",
        nom: "Fiche initiée/affectée",
        service: "SER-007",
      },
      {
        code: "TD-103",
        cote: "2 EOD",
        nom: "Courrier initié/affecté",
        service: "SER-007",
      },
      {
        code: "TD-104",
        cote: "3 EOD",
        nom: "Document de synthèse et d'analyse (des activités d'épargne, journalier de réalisation de tontine des Opérationnels Polyvalents, point hebdomadaire des opérations d'épargne)",
        service: "SER-007",
      },
      {
        code: "TD-105",
        cote: "4 EOD",
        nom: "Registre (de gestion des cartes NFC, gestion des comptes clients)",
        service: "SER-007",
      },

      // ============================================
      // SERVICE MARKETING ET DÉVELOPPEMENT DES PRODUITS (SER-008)
      // ============================================
      {
        code: "TD-106",
        cote: "1 MDP",
        nom: "Fiche initiée/affectée",
        service: "SER-008",
      },
      {
        code: "TD-107",
        cote: "2 MDP",
        nom: "Courrier initié/affecté",
        service: "SER-008",
      },
      {
        code: "TD-108",
        cote: "3 MDP",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel, de mission, Call Center, traitement des plaintes, étude de marché, étude d'ouvertures des points de services, satisfaction client, satisfaction du personnel, etc.)",
        service: "SER-008",
      },
      {
        code: "TD-109",
        cote: "4 MDP",
        nom: "Questionnaires",
        service: "SER-008",
      },
      {
        code: "TD-110",
        cote: "5 MDP",
        nom: "Guide (de discussion pour FOCUS Group ou autres)",
        service: "SER-008",
      },
      {
        code: "TD-111",
        cote: "6 MDP",
        nom: "Carte (de vœux, de visite, d'invitation)",
        service: "SER-008",
      },
      {
        code: "TD-112",
        cote: "7 MDP",
        nom: "Avis et propositions sur dossier de sponsoring",
        service: "SER-008",
      },
      {
        code: "TD-113",
        cote: "8 MDP",
        nom: "Encarts publicitaires, Flyers-prospectus, Prémaquettes et maquettes de supports de communication, etc.",
        service: "SER-008",
      },
      {
        code: "TD-114",
        cote: "9 MDP",
        nom: "Cérémonie officielle et activité spéciale",
        service: "SER-008",
      },

      // ============================================
      // SERVICE SUPPORT ASSISTANCE ET VEILLE TECHNOLOGIQUE (SER-009)
      // ============================================
      {
        code: "TD-115",
        cote: "1 SAVT",
        nom: "Fiche initiée/affectée",
        service: "SER-009",
      },
      {
        code: "TD-116",
        cote: "2 SAVT",
        nom: "Courrier initié/affecté",
        service: "SER-009",
      },
      {
        code: "TD-117",
        cote: "3 SAVT",
        nom: "Document de synthèse et d'analyse, (mensuel, trimestriel, annuel d'activité, d'évaluation, de mission, etc.) Procès-verbal de réception",
        service: "SER-009",
      },
      {
        code: "TD-118",
        cote: "4 SAVT",
        nom: "Manuel de formation",
        service: "SER-009",
      },

      // ============================================
      // SERVICE DÉVELOPPEMENT ET TRANSFORMATION DIGITALE (SER-010)
      // ============================================
      {
        code: "TD-119",
        cote: "1 DTD",
        nom: "Fiche initiée/affectée",
        service: "SER-010",
      },
      {
        code: "TD-120",
        cote: "2 DTD",
        nom: "Courrier initié/affecté",
        service: "SER-010",
      },
      {
        code: "TD-121",
        cote: "3 DTD",
        nom: "Document de synthèse et d'analyse, (mensuel, trimestriel, annuel d'activité, d'évaluation, de mission, etc.) Procès-verbal de réception",
        service: "SER-010",
      },
      {
        code: "TD-122",
        cote: "4 DTD",
        nom: "Manuel de formation",
        service: "SER-010",
      },

      // ============================================
      // SERVICE GESTION ET SÉCURISATION DES SYSTÈMES D'INFORMATION (SER-011)
      // ============================================
      {
        code: "TD-123",
        cote: "1 GSSI",
        nom: "Fiche initiée/affectée",
        service: "SER-011",
      },
      {
        code: "TD-124",
        cote: "2 GSSI",
        nom: "Courrier initié/affecté",
        service: "SER-011",
      },
      {
        code: "TD-125",
        cote: "3 GSSI",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel d'activité, d'évaluation, de mission, etc.) Procès-verbal de réception",
        service: "SER-011",
      },
      {
        code: "TD-126",
        cote: "4 GSSI",
        nom: "Manuel de formation",
        service: "SER-011",
      },
      {
        code: "TD-127",
        cote: "5 GSSI",
        nom: "Synthèse d'information",
        service: "SER-011",
      },

      // ============================================
      // SERVICE CONTRÔLE DES ACTIVITÉS DE LA DIRECTION GÉNÉRALE (SER-012)
      // ============================================
      {
        code: "TD-128",
        cote: "1 CADG",
        nom: "Fiche initiée/affectée",
        service: "SER-012",
      },
      {
        code: "TD-129",
        cote: "2 CADG",
        nom: "Courrier initié/affecté",
        service: "SER-012",
      },
      {
        code: "TD-130",
        cote: "3 CADG",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel d'activité, etc.) et tout autre rapport de contrôle",
        service: "SER-012",
      },

      // ============================================
      // SERVICE CONTRÔLE DES ACTIVITÉS DES AGENCES (SER-013)
      // ============================================
      {
        code: "TD-131",
        cote: "1 CAA",
        nom: "Fiche initiée/affectée",
        service: "SER-013",
      },
      {
        code: "TD-132",
        cote: "2 CAA",
        nom: "Courrier initié/affecté",
        service: "SER-013",
      },
      {
        code: "TD-133",
        cote: "3 CAA",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel d'activité, etc.) et tout autre rapport de contrôle",
        service: "SER-013",
      },

      // ============================================
      // SERVICE ANALYSE DES RISQUES (SER-014)
      // ============================================
      {
        code: "TD-134",
        cote: "1 AR",
        nom: "Fiche initiée/affectée",
        service: "SER-014",
      },
      {
        code: "TD-135",
        cote: "2 AR",
        nom: "Courrier initié/affecté",
        service: "SER-014",
      },
      {
        code: "TD-136",
        cote: "3 AR",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel, de crédit, d'épargne, d'étude de marché, d'analyse de la concurrence, d'étude d'ouverture des points de services, de satisfaction des clients, de satisfaction du personnel, enquête, synthèse d'Informations etc.)",
        service: "SER-014",
      },

      // ============================================
      // SERVICE SUIVI DES RISQUES (SER-015)
      // ============================================
      {
        code: "TD-137",
        cote: "1 SR",
        nom: "Fiche initiée/affectée",
        service: "SER-015",
      },
      {
        code: "TD-138",
        cote: "2 SR",
        nom: "Courrier initié/affecté",
        service: "SER-015",
      },
      {
        code: "TD-139",
        cote: "3 SR",
        nom: "Données statistiques, bulletin des chiffres, fichier des gros débiteurs",
        service: "SER-015",
      },
      {
        code: "TD-140",
        cote: "4 SR",
        nom: "Indicateurs périodiques",
        service: "SER-015",
      },
      {
        code: "TD-141",
        cote: "5 SR",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel d'activités, de déclaration à la CENTIF, circonstancié, etc.) et tout autre rapport",
        service: "SER-015",
      },

      // ============================================
      // POLE D'AUDITEURS INTERNES (SER-016)
      // ============================================
      {
        code: "TD-142",
        cote: "1 PAI",
        nom: "Fiche initiée/affectée",
        service: "SER-016",
      },
      {
        code: "TD-143",
        cote: "2 PAI",
        nom: "Courrier initié/affecté",
        service: "SER-016",
      },
      {
        code: "TD-144",
        cote: "3 PAI",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel d'activité, de mission élargie, de mission d'investigations, d'audit de portefeuilles, de contrôle global, etc.)",
        service: "SER-016",
      },
      {
        code: "TD-145",
        cote: "4 PAI",
        nom: "Synthèse d'informations sur les opérations et synthèse de reporting périodique (CB, CA)",
        service: "SER-016",
      },

      // ============================================
      // CELLULE JURIDIQUE (SER-023)
      // ============================================
      {
        code: "TD-146",
        cote: "1 CJ",
        nom: "Fiche initiée/affectée",
        service: "SER-023",
      },
      {
        code: "TD-147",
        cote: "2 CJ",
        nom: "Courrier initié/affecté",
        service: "SER-023",
      },
      {
        code: "TD-148",
        cote: "3 CJ",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel d'activités, etc.)",
        service: "SER-023",
      },
      {
        code: "TD-149",
        cote: "4 CJ",
        nom: "Contrat (de Dépôt à Terme (DAT), de partenariat, de prestation de service, de bail, etc.)",
        service: "SER-023",
      },
      {
        code: "TD-150",
        cote: "5 CJ",
        nom: "Dossier de contentieux (client personnel prestataire, etc.)",
        service: "SER-023",
      },
      {
        code: "TD-151",
        cote: "6 CJ",
        nom: "Dossier de prêt au personnel",
        service: "SER-023",
      },
      {
        code: "TD-152",
        cote: "7 CJ",
        nom: "Dossier de client concernant sa garantie (demande de copie, substitution, etc.)",
        service: "SER-023",
      },
      {
        code: "TD-153",
        cote: "8 CJ",
        nom: "Convention de garantie réelle",
        service: "SER-023",
      },
      {
        code: "TD-154",
        cote: "9 CJ",
        nom: "Avis juridique / Acte de cautionnement",
        service: "SER-023",
      },

      // ============================================
      // CELLULE DE LA CONFORMITE ET DE LA LCBCFT (SER-002)
      // ============================================
      {
        code: "TD-155",
        cote: "1 CC",
        nom: "Fiche initiée/affectée",
        service: "SER-002",
      },
      {
        code: "TD-156",
        cote: "2 CC",
        nom: "Courrier initié/affecté",
        service: "SER-002",
      },
      {
        code: "TD-157",
        cote: "3 CC",
        nom: "Document de synthèse et d'analyse (mensuel, trimestriel, annuel d'activité, etc.)",
        service: "SER-002",
      },

      // ============================================
      // CELLULE DE LA SECURITE DU SYSTÈME D'INFORMATION (SER-001)
      // ============================================
      {
        code: "TD-158",
        cote: "CSSI",
        nom: "Document appartenant spécialement à la Cellule de la Sécurité du Système d'Information",
        service: "SER-001",
      },

      // ============================================
      // Documents spécifiques aux Directions (sans service)
      // ============================================
      {
        code: "TD-159",
        cote: "DG",
        nom: "Document appartenant spécialement à la Direction Générale",
        direction: "DIR-001",
      },
      {
        code: "TD-160",
        cote: "SDG",
        nom: "Document appartenant spécialement au Secrétariat du Directeur Général",
        direction: "DIR-001",
      },
      {
        code: "TD-161",
        cote: "DAL",
        nom: "Document appartenant spécialement à la Direction de l'Administration et de la Logistique",
        direction: "DIR-008",
      },
      {
        code: "TD-162",
        cote: "DRH",
        nom: "Document appartenant spécialement à la Direction des Ressources Humaines",
        direction: "DIR-009",
      },
      {
        code: "TD-163",
        cote: "DCF",
        nom: "Document appartenant spécialement à la Direction de la Comptabilité et des Finances",
        direction: "DIR-002",
      },
      {
        code: "TD-164",
        cote: "DE",
        nom: "Document appartenant spécialement à la Direction de l'Exploitation",
        direction: "DIR-003",
      },
      {
        code: "TD-165",
        cote: "DDSI",
        nom: "Document appartenant spécialement à la Direction de la Digitalisation et des Systèmes d'Information",
        direction: "DIR-004",
      },
      {
        code: "TD-166",
        cote: "DCP",
        nom: "Document appartenant spécialement à la Direction des Contrôles Permanents",
        direction: "DIR-005",
      },
      {
        code: "TD-167",
        cote: "DGR",
        nom: "Document appartenant spécialement à la Direction de la Gestion des Risques",
        direction: "DIR-006",
      },
      {
        code: "TD-168",
        cote: "DAI",
        nom: "Document appartenant spécialement à la Direction de l'Audit Interne",
        direction: "DIR-007",
      },
      {
        code: "TD-169",
        cote: "SYND",
        nom: "Document appartenant spécialement au syndicat et associations professionnelles",
        direction: null,
      },
      {
        code: "TD-170",
        cote: "AO",
        nom: "Actes officiels (Loi, Ordonnance, Décret, Traités, Circulaire, Instruction, Convention, Registres des actes officiels, etc.)",
        direction: null,
      },
      {
        code: "TD-171",
        cote: "AG/CA",
        nom: "Document de l'Assemblée Générale et du Conseil d'Administration",
        direction: null,
      },
      {
        code: "TD-172",
        cote: "DI",
        nom: "Documentation (ensemble de monographies, de littérature grise, journaux, magazines, iconographies- photo album, audiovisuel, etc.) acquise ou rédigée par l'institution",
        direction: null,
      },
      {
        code: "TD-173",
        cote: "ORG",
        nom: "Manuel de procédures, politiques, statut, règlement intérieur, convention collective etc.",
        direction: null,
      },
      {
        code: "TD-174",
        cote: "REG",
        nom: "Registres de présence",
        direction: null,
      },
    ];

    let typesCrees = 0;
    let typesExistants = 0;

    for (const data of typeDocumentsData) {
      // Déterminer les IDs d'entité
      let entitee_un_id = null;
      let entitee_deux_id = null;

      if (data.service) {
        const entityIds = getEntityIds(data.service);
        entitee_deux_id = entityIds.entitee_deux_id;
        entitee_un_id = entityIds.entitee_un_id;
      } else if (data.direction) {
        entitee_un_id = directions[data.direction];
        if (!entitee_un_id) {
          console.warn(`⚠️ Direction non trouvée: ${data.direction}`);
        }
      }

      const [typeDoc, created] = await db.TypeDocument.findOrCreate({
        where: { code: data.code },
        defaults: {
          code: data.code,
          cote: data.cote,
          nom: data.nom,
          entitee_un_id: entitee_un_id,
          entitee_deux_id: entitee_deux_id,
          entitee_trois_id: null,
        },
        transaction,
      });

      if (created) {
        typesCrees++;
        const entityInfo = data.service
          ? `→ ${data.service}`
          : data.direction
            ? `→ ${data.direction}`
            : "→ Général";
        console.log(
          `   ✅ Créé: ${data.code} - ${data.nom.substring(0, 50)}... ${entityInfo}`,
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
