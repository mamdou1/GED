// scripts/organigrameFonction.js
const db = require("../models");

async function insertOrganigrameData() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log("🚀 Début de l'insertion des données d'organigramme...\n");

    // ============================================
    // 1. Insertion des Entités de niveau 1 (Directions)
    // ============================================
    console.log("📌 Insertion des entités de niveau 1 (Directions)...");

    const entiteesUnData = [
      { titre: "Direction", code: "DIR-001", libelle: "Direction générale" },
      {
        titre: "Direction",
        code: "DIR-002",
        libelle: "DIRECTION DE LA COMPTABILITE ET DES FINANCES",
      },
      {
        titre: "Direction",
        code: "DIR-003",
        libelle: "DIRECTION DE L'EXPLOITATION",
      },
      {
        titre: "Direction",
        code: "DIR-004",
        libelle:
          "DIRECTION DE LA DIGITALISATION ET DES SYSTÈMES D'INFORMATIONS",
      },
      {
        titre: "Direction",
        code: "DIR-005",
        libelle: "DIRECTION DU CONTRÔLE PERMANENT",
      },
      {
        titre: "Direction",
        code: "DIR-006",
        libelle: "DIRECTION DE LA GESTION DES RISQUES",
      },
      {
        titre: "Direction",
        code: "DIR-007",
        libelle: "DIRECTION DE L'AUDIT INTERNE",
      },
      {
        titre: "Direction",
        code: "DIR-008",
        libelle: "DIRECTION DE L'ADMINISTRATION ET DE LA LOGISTIQUE",
      },
      {
        titre: "Direction",
        code: "DIR-009",
        libelle: "DIRECTION DES RESSOURCES HUMAINES",
      },
      { titre: "Direction", code: "DIR-012", libelle: "AGENCES" },
    ];

    const entiteesUnMap = new Map();

    for (const data of entiteesUnData) {
      const [entite, created] = await db.EntiteeUn.findOrCreate({
        where: { code: data.code },
        defaults: data,
        transaction,
      });

      entiteesUnMap.set(data.code, entite.id);

      if (created) {
        console.log(`   ✅ Créé: ${data.libelle} (${data.code})`);
      } else {
        console.log(`   ℹ️ Existe déjà: ${data.libelle} (${data.code})`);
      }
    }

    // ============================================
    // 2. Insertion des Entités de niveau 2 (Services)
    // ============================================
    console.log("\n📌 Insertion des entités de niveau 2 (Services)...");

    const entiteesDeuxData = [
      {
        titre: "Service",
        code: "SER-001",
        libelle: "CELLULE DE LA SECURITE DU SYSTÈME D'INFORMATION",
        entitee_un_code: "DIR-001",
      },
      {
        titre: "Service",
        code: "SER-002",
        libelle: "CELLULE DE LA CONFORMITE ET DE LA LCBCFT",
        entitee_un_code: "DIR-001",
      },
      {
        titre: "Service",
        code: "SER-003",
        libelle: "SERVICE DE LA COMPTABILITE",
        entitee_un_code: "DIR-002",
      },
      {
        titre: "Service",
        code: "SER-004",
        libelle: "SERVICE DE LA TRESORERIE ET DES FINANCEMENTS",
        entitee_un_code: "DIR-002",
      },
      {
        titre: "Service",
        code: "SER-005",
        libelle: "SERVICE DU BUDGET ET DU CONTRÔLE DE GESTION",
        entitee_un_code: "DIR-002",
      },
      {
        titre: "Service",
        code: "SER-006",
        libelle: "SERVICE DU CREDIT",
        entitee_un_code: "DIR-003",
      },
      {
        titre: "Service",
        code: "SER-007",
        libelle: "SERVICE DE L'EPARGNE ET DES OPERATIONS DIVERSES",
        entitee_un_code: "DIR-003",
      },
      {
        titre: "Service",
        code: "SER-008",
        libelle: "SERVICE DU MARKETING ET DU DEVELOPPEMENT DES PRODUITS",
        entitee_un_code: "DIR-003",
      },
      {
        titre: "Service",
        code: "SER-009",
        libelle:
          "SERVICE DU SUPPORT, DE L'ASSISTANCE ET DE LA VEILLE TECHNOLOGIQUE",
        entitee_un_code: "DIR-004",
      },
      {
        titre: "Service",
        code: "SER-010",
        libelle: "SERVICE DU DEVELOPPEMENT ET DE LA TRANSFORMATION DIGITALE",
        entitee_un_code: "DIR-004",
      },
      {
        titre: "Service",
        code: "SER-011",
        libelle:
          "SERVICE DE LA GESTION ET DE LA SECURISATION DES SYSTEMES D'INFORMATIONS",
        entitee_un_code: "DIR-004",
      },
      {
        titre: "Service",
        code: "SER-012",
        libelle: "SERVICE DU CONTRÔLE DES ACTIVITES DE LA DIRECTION GENERALE",
        entitee_un_code: "DIR-005",
      },
      {
        titre: "Service",
        code: "SER-013",
        libelle: "SERVICE DU CONTRÔLE DES ACTIVITES DES AGENCES",
        entitee_un_code: "DIR-005",
      },
      {
        titre: "Service",
        code: "SER-014",
        libelle: "SERVICE DE L'ANALYSE DES RISQUES",
        entitee_un_code: "DIR-006",
      },
      {
        titre: "Service",
        code: "SER-015",
        libelle: "SERVICE DU SUIVI DES RISQUES",
        entitee_un_code: "DIR-006",
      },
      {
        titre: "Service",
        code: "SER-016",
        libelle: "POLE D'AUDITEURS INTERNE",
        entitee_un_code: "DIR-007",
      },
      {
        titre: "Service",
        code: "SER-017",
        libelle: "SERVICE DU SECRETARIAT ADMINISTRATIF",
        entitee_un_code: "DIR-008",
      },
      {
        titre: "Service",
        code: "SER-018",
        libelle: "SERVICE DU PATRIMOINE ET DE LA LOGISTIQUE",
        entitee_un_code: "DIR-008",
      },
      {
        titre: "Service",
        code: "SER-019",
        libelle: "SERVICE DES ARCHIVES",
        entitee_un_code: "DIR-008",
      },
      {
        titre: "Service",
        code: "SER-020",
        libelle:
          "SERVICE DE L'ADMINISTRATION DU PERSONNEL ET DES RELATIONS SOCIALES",
        entitee_un_code: "DIR-009",
      },
      {
        titre: "Service",
        code: "SER-021",
        libelle:
          "SERVICE DU RECRUTEMENT DE LA GESTION DES PERFORMANCES ET DE LA MOBILITE",
        entitee_un_code: "DIR-009",
      },
      {
        titre: "Service",
        code: "SER-022",
        libelle: "SERVICE DE LA FORMATION",
        entitee_un_code: "DIR-009",
      },
      {
        titre: "Service",
        code: "SER-023",
        libelle: "CELLULE JURIDIQUE",
        entitee_un_code: "DIR-001",
      },
    ];

    const entiteesDeuxMap = new Map();

    for (const data of entiteesDeuxData) {
      const entiteeUnId = entiteesUnMap.get(data.entitee_un_code);

      if (!entiteeUnId) {
        console.log(`   ⚠️ Entité parente non trouvée pour ${data.libelle}`);
        continue;
      }

      const [entite, created] = await db.EntiteeDeux.findOrCreate({
        where: { code: data.code },
        defaults: {
          titre: data.titre,
          code: data.code,
          libelle: data.libelle,
          entitee_un_id: entiteeUnId,
        },
        transaction,
      });

      entiteesDeuxMap.set(data.code, entite.id);

      if (created) {
        console.log(`   ✅ Créé: ${data.libelle} (${data.code})`);
      } else {
        console.log(`   ℹ️ Existe déjà: ${data.libelle} (${data.code})`);
      }
    }

    // ============================================
    // 3. Insertion des Fonctions (TOUTES les fonctions)
    // ============================================
    console.log("\n📌 Insertion des fonctions...");

    const fonctionsData = [
      // Fonctions liées aux entités de niveau 1 (Directions)
      {
        libelle: "Directeur Général",
        entitee_un_code: "DIR-001",
        entitee_deux_code: null,
      },
      {
        libelle: "Assistant du Directeur Général",
        entitee_un_code: "DIR-001",
        entitee_deux_code: null,
      },
      {
        libelle: "DIRECTEUR DE LA COMPTABILITE ET DES FINANCES",
        entitee_un_code: "DIR-002",
        entitee_deux_code: null,
      },
      {
        libelle: "DIRECTEUR DE L'EXPLOITATION",
        entitee_un_code: "DIR-003",
        entitee_deux_code: null,
      },
      {
        libelle:
          "DIRECTEUR DE LA DIGITALISATION ET DES SYSTÈMES D'INFORMATIONS",
        entitee_un_code: "DIR-004",
        entitee_deux_code: null,
      },
      {
        libelle: "DIRECTEUR DU CONTRÔLE PERMANENT",
        entitee_un_code: "DIR-005",
        entitee_deux_code: null,
      },
      {
        libelle: "DIRECTEUR DE LA GESTION DES RISQUES",
        entitee_un_code: "DIR-006",
        entitee_deux_code: null,
      },
      {
        libelle: "DIRECTEUR DE L'AUDIT INTERNE",
        entitee_un_code: "DIR-007",
        entitee_deux_code: null,
      },
      {
        libelle: "DIRECTEUR DE L'ADMINISTRATION ET DE LA LOGISTIQUE",
        entitee_un_code: "DIR-008",
        entitee_deux_code: null,
      },
      {
        libelle: "DIRECTEUR DES RESSOURCES HUMAINES",
        entitee_un_code: "DIR-009",
        entitee_deux_code: null,
      },

      // Fonctions liées aux AGENCES (DIR-012)
      {
        libelle: "Chef d’Agence",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Assistant au Chef d’Agence",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Agent Administratif",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Agent Comptable",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Superviseur des Recouvrements",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Agent de Recouvrement",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Agent de liaison",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Conducteur de véhicule",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Chef de Bureau",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Agent de Bureau",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Animateur",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Caissier",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Chargé de prêt",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Superviseur d’Épargne",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },
      {
        libelle: "Collecteur d’Épargne",
        entitee_un_code: "DIR-012",
        entitee_deux_code: null,
      },

      // Fonctions liées au SERVICE DE LA COMPTABILITE (SER-003)
      {
        libelle: "Chef du Service de la Comptabilité",
        entitee_un_code: null,
        entitee_deux_code: "SER-003",
      },
      {
        libelle: "Chargé de la Comptabilité Générale",
        entitee_un_code: null,
        entitee_deux_code: "SER-003",
      },
      {
        libelle: "Agents d'appui à la comptabilité",
        entitee_un_code: null,
        entitee_deux_code: "SER-003",
      },

      // Fonctions liées au SERVICE DE LA TRESORERIE ET DES FINANCEMENTS (SER-004)
      {
        libelle: "Chef du Service de la Trésorerie et des Financements",
        entitee_un_code: null,
        entitee_deux_code: "SER-004",
      },
      {
        libelle: "Chargé de la Trésorerie Opérationnelle",
        entitee_un_code: null,
        entitee_deux_code: "SER-004",
      },
      {
        libelle: "Chargé de Mobilisation des Fonds",
        entitee_un_code: null,
        entitee_deux_code: "SER-004",
      },
      {
        libelle: "Chargé des Financements et Relations Bancaires",
        entitee_un_code: null,
        entitee_deux_code: "SER-004",
      },
      {
        libelle: "Agents d'appui aux finances",
        entitee_un_code: null,
        entitee_deux_code: "SER-004",
      },

      // Fonctions liées au SERVICE DU BUDGET ET DU CONTRÔLE DE GESTION (SER-005)
      {
        libelle: "Chef du Service du Budget et du Contrôle de Gestion",
        entitee_un_code: null,
        entitee_deux_code: "SER-005",
      },
      {
        libelle: "Chargé de la Comptabilité Analytique",
        entitee_un_code: null,
        entitee_deux_code: "SER-005",
      },
      {
        libelle: "Chargé de l’Élaboration et du Suivi Budgétaire",
        entitee_un_code: null,
        entitee_deux_code: "SER-005",
      },
      {
        libelle:
          "Chargé du Contrôle de Gestion et de la Performance Financière",
        entitee_un_code: null,
        entitee_deux_code: "SER-005",
      },

      // Fonctions liées au SERVICE DU CREDIT (SER-006)
      {
        libelle: "Chef du Service du Crédit",
        entitee_un_code: null,
        entitee_deux_code: "SER-006",
      },
      {
        libelle: "Chargé du Crédit Classique",
        entitee_un_code: null,
        entitee_deux_code: "SER-006",
      },
      {
        libelle: "Agents d'appui au crédit classique",
        entitee_un_code: null,
        entitee_deux_code: "SER-006",
      },
      {
        libelle: "Chargé du Crédit Agricole",
        entitee_un_code: null,
        entitee_deux_code: "SER-006",
      },
      {
        libelle: "Agents d'appui au crédit agricole",
        entitee_un_code: null,
        entitee_deux_code: "SER-006",
      },
      {
        libelle: "Chargé des Crédits Spécifiques",
        entitee_un_code: null,
        entitee_deux_code: "SER-006",
      },
      {
        libelle: "Agents d'appui aux crédits spécifiques",
        entitee_un_code: null,
        entitee_deux_code: "SER-006",
      },

      // Fonctions liées au SERVICE DE L'EPARGNE ET DES OPERATIONS DIVERSES (SER-007)
      {
        libelle: "Chef du Service de l’Épargne et des Opérations Diverses",
        entitee_un_code: null,
        entitee_deux_code: "SER-007",
      },
      {
        libelle: "Chargé de l’Épargne Planifiée",
        entitee_un_code: null,
        entitee_deux_code: "SER-007",
      },
      {
        libelle: "Agents d'appui à l’épargne",
        entitee_un_code: null,
        entitee_deux_code: "SER-007",
      },
      {
        libelle: "Chargé de l’Épargne Non Planifiée",
        entitee_un_code: null,
        entitee_deux_code: "SER-007",
      },
      {
        libelle: "Chargé des Opérations Diverses",
        entitee_un_code: null,
        entitee_deux_code: "SER-007",
      },
      {
        libelle: "Agents d'appui aux opérations diverses",
        entitee_un_code: null,
        entitee_deux_code: "SER-007",
      },

      // Fonctions liées au SERVICE MARKETING ET DU DEVELOPPEMENT DES PRODUITS (SER-008)
      {
        libelle: "Chef du Service Marketing et du Développement des Produits",
        entitee_un_code: null,
        entitee_deux_code: "SER-008",
      },
      {
        libelle: "Chargé du Développement des Produits",
        entitee_un_code: null,
        entitee_deux_code: "SER-008",
      },
      {
        libelle: "Chargé de la Promotion des Produits",
        entitee_un_code: null,
        entitee_deux_code: "SER-008",
      },
      {
        libelle:
          "Chargé de la Communication et de la Gestion de la Relation Client",
        entitee_un_code: null,
        entitee_deux_code: "SER-008",
      },
      {
        libelle: "Agents d'appui au marketing",
        entitee_un_code: null,
        entitee_deux_code: "SER-008",
      },
      {
        libelle: "Agents d’appui à la communication digitale",
        entitee_un_code: null,
        entitee_deux_code: "SER-008",
      },

      // Fonctions liées au SERVICE DE L'ANALYSE DES RISQUES (SER-014)
      {
        libelle: "Chef du Service de l'Analyse des Risques",
        entitee_un_code: null,
        entitee_deux_code: "SER-014",
      },
      {
        libelle: "Chargés de l’analyse des risques",
        entitee_un_code: null,
        entitee_deux_code: "SER-014",
      },

      // Fonctions liées au SERVICE DU SUIVI DES RISQUES (SER-015)
      {
        libelle: "Chef du Service du Suivi des Risques",
        entitee_un_code: null,
        entitee_deux_code: "SER-015",
      },
      {
        libelle: "Chargés du suivi des risques",
        entitee_un_code: null,
        entitee_deux_code: "SER-015",
      },
      {
        libelle: "Chargé du Recouvrement",
        entitee_un_code: null,
        entitee_deux_code: "SER-015",
      },
      {
        libelle: "Agents d'appui au recouvrement",
        entitee_un_code: null,
        entitee_deux_code: "SER-015",
      },

      // Fonctions liées au POLE D'AUDITEURS INTERNE (SER-016)
      {
        libelle: "Auditeurs",
        entitee_un_code: null,
        entitee_deux_code: "SER-016",
      },

      // Fonctions liées au SERVICE DU SUPPORT (SER-009)
      {
        libelle:
          "Chef du Service du Support, de l’Assistance et de la Veille Technologique",
        entitee_un_code: null,
        entitee_deux_code: "SER-009",
      },
      {
        libelle:
          "Chargé du Support Utilisateurs et de la Maintenance Informatique",
        entitee_un_code: null,
        entitee_deux_code: "SER-009",
      },
      {
        libelle: "Informaticiens",
        entitee_un_code: null,
        entitee_deux_code: "SER-009",
      },
      {
        libelle: "Chargé de la Veille Technologique et de l’Innovation",
        entitee_un_code: null,
        entitee_deux_code: "SER-009",
      },

      // Fonctions liées au SERVICE DU DEVELOPPEMENT (SER-010)
      {
        libelle:
          "Chef du Service du Développement et de la Transformation Digitale",
        entitee_un_code: null,
        entitee_deux_code: "SER-010",
      },
      {
        libelle: "Chargé du Développement Applicatif et de l’Intégration",
        entitee_un_code: null,
        entitee_deux_code: "SER-010",
      },
      {
        libelle: "Informaticiens",
        entitee_un_code: null,
        entitee_deux_code: "SER-010",
      },
      {
        libelle:
          "Chargé de la Transformation Digitale et de la Digitalisation des Processus",
        entitee_un_code: null,
        entitee_deux_code: "SER-010",
      },

      // Fonctions liées au SERVICE DE LA GESTION ET DE LA SECURISATION (SER-011)
      {
        libelle:
          "Chef du Service de la Gestion et de la Sécurisation des Systèmes d’Information",
        entitee_un_code: null,
        entitee_deux_code: "SER-011",
      },
      {
        libelle: "Chargé de l’Infrastructure Systèmes et des Réseaux",
        entitee_un_code: null,
        entitee_deux_code: "SER-011",
      },
      {
        libelle: "Informaticiens",
        entitee_un_code: null,
        entitee_deux_code: "SER-011",
      },
      {
        libelle: "Chargé de la Sécurité Informatique",
        entitee_un_code: null,
        entitee_deux_code: "SER-011",
      },

      // Fonctions liées au SERVICE DU CONTRÔLE DES ACTIVITES DE LA DIRECTION GENERALE (SER-012)
      {
        libelle:
          "Chef du Service du Contrôle des Activités de la Direction Générale",
        entitee_un_code: null,
        entitee_deux_code: "SER-012",
      },
      {
        libelle: "Contrôleur Permanent des Activités de la Direction Générale",
        entitee_un_code: null,
        entitee_deux_code: "SER-012",
      },

      // Fonctions liées au SERVICE DU CONTRÔLE DES ACTIVITES DES AGENCES (SER-013)
      {
        libelle: "Chef du Service du Contrôle des Activités d'Agence",
        entitee_un_code: null,
        entitee_deux_code: "SER-013",
      },
      {
        libelle: "Contrôleur Permanent des Activités d'Agence",
        entitee_un_code: null,
        entitee_deux_code: "SER-013",
      },

      // Fonctions liées au SERVICE DU SECRETARIAT ADMINISTRATIF (SER-017)
      {
        libelle: "Chef du Service du Secrétariat Administratif",
        entitee_un_code: null,
        entitee_deux_code: "SER-017",
      },
      {
        libelle: "Agent d'appui au secrétariat",
        entitee_un_code: null,
        entitee_deux_code: "SER-017",
      },
      {
        libelle: "Agent de liaison",
        entitee_un_code: null,
        entitee_deux_code: "SER-017",
      },

      // Fonctions liées au SERVICE DU PATRIMOINE ET DE LA LOGISTIQUE (SER-018)
      {
        libelle: "Chef du Service du Patrimoine et de la Logistique",
        entitee_un_code: null,
        entitee_deux_code: "SER-018",
      },
      {
        libelle: "Chargé des Achats",
        entitee_un_code: null,
        entitee_deux_code: "SER-018",
      },
      {
        libelle: "Agent d'appui aux achats",
        entitee_un_code: null,
        entitee_deux_code: "SER-018",
      },
      {
        libelle: "Chargé de la Logistique",
        entitee_un_code: null,
        entitee_deux_code: "SER-018",
      },
      {
        libelle: "Agent d'appui à la logistique",
        entitee_un_code: null,
        entitee_deux_code: "SER-018",
      },
      {
        libelle: "Chargé de la Gestion du Patrimoine",
        entitee_un_code: null,
        entitee_deux_code: "SER-018",
      },
      {
        libelle: "Agent d'appui à la gestion du patrimoine",
        entitee_un_code: null,
        entitee_deux_code: "SER-018",
      },
      {
        libelle: "Conducteur de véhicule",
        entitee_un_code: null,
        entitee_deux_code: "SER-018",
      },

      // Fonctions liées au SERVICE DES ARCHIVES (SER-019)
      {
        libelle: "Chef du Service de la Documentation et des Archives",
        entitee_un_code: null,
        entitee_deux_code: "SER-019",
      },
      {
        libelle: "Chargé de la documentation",
        entitee_un_code: null,
        entitee_deux_code: "SER-019",
      },
      {
        libelle: "Chargé des archives",
        entitee_un_code: null,
        entitee_deux_code: "SER-019",
      },
      {
        libelle: "Agent d'appui aux archives",
        entitee_un_code: null,
        entitee_deux_code: "SER-019",
      },

      // Fonctions liées au SERVICE DE L'ADMINISTRATION DU PERSONNEL (SER-020)
      {
        libelle:
          "Chef du Service de l’Administration du Personnel et des Relations Sociales",
        entitee_un_code: null,
        entitee_deux_code: "SER-020",
      },
      {
        libelle: "Chargé de la Gestion Administrative et des Contrats",
        entitee_un_code: null,
        entitee_deux_code: "SER-020",
      },
      {
        libelle: "Chargé des Relations Sociales",
        entitee_un_code: null,
        entitee_deux_code: "SER-020",
      },
      {
        libelle: "Chargé de la Paie et de la Gestion des Temps de Travail",
        entitee_un_code: null,
        entitee_deux_code: "SER-020",
      },
      {
        libelle: "Agents d'appui aux RH",
        entitee_un_code: null,
        entitee_deux_code: "SER-020",
      },

      // Fonctions liées au SERVICE DU RECRUTEMENT (SER-021)
      {
        libelle:
          "Chef du Service du Recrutement, de la Gestion des Performances et de la Mobilité",
        entitee_un_code: null,
        entitee_deux_code: "SER-021",
      },
      {
        libelle: "Chargé du Recrutement, de l’évaluation et de la Mobilité",
        entitee_un_code: null,
        entitee_deux_code: "SER-021",
      },
      {
        libelle: "Agents d'appui aux RH",
        entitee_un_code: null,
        entitee_deux_code: "SER-021",
      },
      {
        libelle: "Chef du Service de la Formation",
        entitee_un_code: null,
        entitee_deux_code: "SER-021",
      },
      {
        libelle: "Chargé de la Gestion des Formations",
        entitee_un_code: null,
        entitee_deux_code: "SER-021",
      },
      {
        libelle: "Agents d'appui aux RH",
        entitee_un_code: null,
        entitee_deux_code: "SER-021",
      },

      // Fonctions liées à la CELLULE JURIDIQUE (SER-023)
      {
        libelle: "Responsable de la Cellule Juridique",
        entitee_un_code: null,
        entitee_deux_code: "SER-023",
      },
      {
        libelle: "Chargés de l’Analyse Juridique",
        entitee_un_code: null,
        entitee_deux_code: "SER-023",
      },

      // Fonctions liées à la CELLULE DE LA SECURITE (SER-001)
      {
        libelle:
          "Responsable de la Cellule de la Sécurité du Système d’Information",
        entitee_un_code: null,
        entitee_deux_code: "SER-001",
      },
      {
        libelle:
          "Chargés de l’Analyse des risques de Sécurité du Système d’Information",
        entitee_un_code: null,
        entitee_deux_code: "SER-001",
      },

      // Fonctions liées à la CELLULE DE LA CONFORMITE (SER-002)
      {
        libelle: "Responsable de la Cellule de la Conformité et de la LCBCFT",
        entitee_un_code: null,
        entitee_deux_code: "SER-002",
      },
      {
        libelle: "Chargés de l’Analyse des risques de Conformité et de LCBCFT",
        entitee_un_code: null,
        entitee_deux_code: "SER-002",
      },
    ];

    let fonctionsCrees = 0;
    let fonctionsExistantes = 0;

    for (const data of fonctionsData) {
      const whereClause = { libelle: data.libelle };

      // Ajouter les relations si elles existent
      if (data.entitee_un_code) {
        whereClause.entitee_un_id = entiteesUnMap.get(data.entitee_un_code);
      }
      if (data.entitee_deux_code) {
        whereClause.entitee_deux_id = entiteesDeuxMap.get(
          data.entitee_deux_code,
        );
      }

      const defaults = {
        libelle: data.libelle,
        entitee_un_id: data.entitee_un_code
          ? entiteesUnMap.get(data.entitee_un_code)
          : null,
        entitee_deux_id: data.entitee_deux_code
          ? entiteesDeuxMap.get(data.entitee_deux_code)
          : null,
        entitee_trois_id: null,
      };

      const [fonction, created] = await db.Fonction.findOrCreate({
        where: whereClause,
        defaults,
        transaction,
      });

      if (created) {
        fonctionsCrees++;
        console.log(`   ✅ Créé: ${data.libelle}`);
      } else {
        fonctionsExistantes++;
      }
    }

    console.log(`   ✅ ${fonctionsCrees} nouvelles fonctions créées`);
    console.log(`   ℹ️ ${fonctionsExistantes} fonctions existantes`);

    // ============================================
    // 4. Récapitulatif final
    // ============================================
    console.log("\n📊 Récapitulatif :");
    console.log(`   Entités de niveau 1 (Directions): ${entiteesUnMap.size}`);
    console.log(`   Entités de niveau 2 (Services): ${entiteesDeuxMap.size}`);
    console.log(
      `   Fonctions: ${fonctionsCrees} créées, ${fonctionsExistantes} existantes`,
    );
    console.log(
      `   Total des fonctions dans la base: ${fonctionsCrees + fonctionsExistantes}`,
    );

    await transaction.commit();
    console.log("\n✨ Script exécuté avec succès !");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Erreur lors de l'exécution du script :", error);
    throw error;
  }
}

// Exécution du script
insertOrganigrameData()
  .then(() => {
    console.log("🏁 Fin du script");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Le script a échoué :", error);
    process.exit(1);
  });
