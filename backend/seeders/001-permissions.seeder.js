const { Permission } = require("../models");

module.exports = async () => {
  const permissions = [
    // ==================== EXERCICE ====================
    { resource: "exercice", action: "access" },
    { resource: "exercice", action: "create" },
    { resource: "exercice", action: "read" },
    { resource: "exercice", action: "update" },
    { resource: "exercice", action: "delete" },

    // ==================== AGENT ====================
    { resource: "agent", action: "access" },
    { resource: "agent", action: "create" },
    { resource: "agent", action: "read" },
    { resource: "agent", action: "update" },
    { resource: "agent", action: "delete" },

    // ==================== PIECES ====================
    { resource: "pieces", action: "access" },
    { resource: "pieces", action: "create" },
    { resource: "pieces", action: "read" },
    { resource: "pieces", action: "update" },
    { resource: "pieces", action: "delete" },

    // ==================== STATISTIQUE ====================
    { resource: "statistique", action: "access" },
    { resource: "statistique", action: "create" },
    { resource: "statistique", action: "read" },
    { resource: "statistique", action: "update" },

    // ==================== DROIT ====================
    { resource: "droit", action: "access" },
    { resource: "droit", action: "create" },
    { resource: "droit", action: "read" },
    { resource: "droit", action: "update" },
    { resource: "droit", action: "delete" },

    // ==================== FONCTION ====================
    { resource: "fonction", action: "access" },
    { resource: "fonction", action: "read" },
    { resource: "fonction", action: "create" },
    { resource: "fonction", action: "update" },
    { resource: "fonction", action: "delete" },

    // ==================== DOCUMENT ====================
    { resource: "document", action: "access" },
    { resource: "document", action: "read" },
    { resource: "document", action: "create" },
    { resource: "document", action: "update" },
    { resource: "document", action: "delete" },

    // ==================== DOCUMENT TYPE ====================
    { resource: "documentType", action: "access" },
    { resource: "documentType", action: "read" },
    { resource: "documentType", action: "create" },
    { resource: "documentType", action: "update" },
    { resource: "documentType", action: "delete" },

    // ==================== HISTORIQUE ====================
    { resource: "historique", action: "access" },
    { resource: "historique", action: "read" },

    // ==================== ENTITE UN ====================
    { resource: "entiteeUn", action: "access" },
    { resource: "entiteeUn", action: "create" },
    { resource: "entiteeUn", action: "read" },
    { resource: "entiteeUn", action: "update" },
    { resource: "entiteeUn", action: "delete" },

    // ==================== ENTITE DEUX ====================
    { resource: "entiteeDeux", action: "access" },
    { resource: "entiteeDeux", action: "create" },
    { resource: "entiteeDeux", action: "read" },
    { resource: "entiteeDeux", action: "update" },
    { resource: "entiteeDeux", action: "delete" },

    // ==================== ENTITE TROIS ====================
    { resource: "entiteeTrois", action: "access" },
    { resource: "entiteeTrois", action: "create" },
    { resource: "entiteeTrois", action: "read" },
    { resource: "entiteeTrois", action: "update" },
    { resource: "entiteeTrois", action: "delete" },

    // ==================== SALLE ====================
    { resource: "salle", action: "access" },
    { resource: "salle", action: "create" },
    { resource: "salle", action: "read" },
    { resource: "salle", action: "update" },
    { resource: "salle", action: "delete" },

    // ==================== RAYON ====================
    { resource: "rayon", action: "access" },
    { resource: "rayon", action: "create" },
    { resource: "rayon", action: "read" },
    { resource: "rayon", action: "update" },
    { resource: "rayon", action: "delete" },

    // ==================== BOX ====================
    { resource: "box", action: "access" },
    { resource: "box", action: "create" },
    { resource: "box", action: "read" },
    { resource: "box", action: "update" },
    { resource: "box", action: "delete" },

    // ==================== TRAVE ====================
    { resource: "trave", action: "access" },
    { resource: "trave", action: "create" },
    { resource: "trave", action: "read" },
    { resource: "trave", action: "update" },
    { resource: "trave", action: "delete" },

    // ==================== SITE ====================
    { resource: "site", action: "access" },
    { resource: "site", action: "create" },
    { resource: "site", action: "read" },
    { resource: "site", action: "update" },
    { resource: "site", action: "delete" },

    // ==================== CLIENT ====================
    { resource: "client", action: "access" },
    { resource: "client", action: "create" },
    { resource: "client", action: "read" },
    { resource: "client", action: "update" },
    { resource: "client", action: "delete" },

    // ==================== COMPTES ====================
    { resource: "compte", action: "access" },
    { resource: "compte", action: "create" },
    { resource: "compte", action: "read" },
    { resource: "compte", action: "update" },
    { resource: "compte", action: "delete" },

    // ==================== TYPE COMPTES ====================
    { resource: "typeCompte", action: "access" },
    { resource: "typeCompte", action: "create" },
    { resource: "typeCompte", action: "read" },
    { resource: "typeCompte", action: "update" },
    { resource: "typeCompte", action: "delete" },

    // ==================== COURRIER ====================

    { resource: "courrier", action: "access" },
    { resource: "courrier", action: "create" },
    { resource: "courrier", action: "read" },
    { resource: "courrier", action: "update" },
    { resource: "courrier", action: "delete" },

    { resource: "destinataire_externe", action: "access" },
    { resource: "destinataire_externe", action: "create" },
    { resource: "destinataire_externe", action: "read" },
    { resource: "destinataire_externe", action: "update" },
    { resource: "destinataire_externe", action: "delete" },

    { resource: "destinataire_externe", action: "access" },
    { resource: "destinataire_externe", action: "create" },
    { resource: "destinataire_externe", action: "read" },
    { resource: "destinataire_externe", action: "update" },
    { resource: "destinataire_externe", action: "delete" },

    { resource: "expediteur", action: "access" },
    { resource: "expediteur", action: "create" },
    { resource: "expediteur", action: "read" },
    { resource: "expediteur", action: "update" },
    { resource: "expediteur", action: "delete" },

    { resource: "peutVoirCourrierEntiteeUn", action: "read" },
    { resource: "peutVoirCourrierEntiteeDeux", action: "read" },
    { resource: "peutVoirCourrierEntiteeTrois", action: "read" },

    { resource: "mesCourrier", action: "update" },
  ];

  console.log("⏳ Seeding permissions...");

  for (const perm of permissions) {
    await Permission.findOrCreate({
      where: {
        resource: perm.resource,
        action: perm.action,
      },
    });
  }

  const count = await Permission.count();
  console.log("✅ Permissions en base :", count);

  console.log("✅ Permissions seedées");
};
