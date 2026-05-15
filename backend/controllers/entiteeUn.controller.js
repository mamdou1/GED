// controllers/entiteeUn.controller.js
const { EntiteeUn, Fonction } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const entityTypeDocumentService = require("../services/entityTypeDocument.service");


exports.createEntiteeUn = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📝 Tentative de création d'une entité de niveau 1", {
      userId: req.user?.id,
      body: req.body,
    });

    const { libelle } = req.body;

    const count = await EntiteeUn.count();
    // 1. Trouver le titre utilisé par les autres éléments
    const exemple = await EntiteeUn.findOne({ attributes: ["titre"] });
    logger.info("🔍 Exemple trouvé:", exemple);

    const titreGlobal = exemple?.titre || "Défaut";
    logger.info("🎯 Titre global:", titreGlobal);

    const prefixe = titreGlobal.trim().slice(0, 3).toUpperCase();

    const nextNumber = count + 1;
    const paddedNumber = nextNumber.toString().padStart(3, "0");
    const code_pieces = `${prefixe}-${paddedNumber}`;

    // 2. Créer l'élément avec le titre récupéré
    const entitee_un = await EntiteeUn.create({
      code: code_pieces,
      libelle,
      titre: titreGlobal,
    });

    logger.info("✅ Entité de niveau 1 créée avec succès", {
      entiteeId: entitee_un.id,
      libelle: entitee_un.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "entiteeUn", entitee_un);

    res.status(201).json(entitee_un);
  } catch (err) {
    logger.error("❌ Erreur création entiteeUn:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur création entitee_un",
      error: err.message,
    });
  }
};

exports.getAllEntiteeUn = async (req, res) => {
  const startTime = Date.now();

  try {
    const entitee_un = await EntiteeUn.findAll();

    res.json(entitee_un);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur récupération entitee_un", error: err.message });
  }
};

exports.getEntiteeUnTitre = async (req, res) => {
  try {
    const entitee = await EntiteeUn.findOne({ attributes: ["titre"] });

    if (!entitee) {
      return res.status(200).json({ titre: "" });
    }

    res.status(200).json({ titre: entitee.titre || "" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEntiteeUnTitre = async (req, res) => {
  const startTime = Date.now();

  try {
    const { titre } = req.body;
    if (!titre) {
      logger.warn("⚠️ Tentative de mise à jour sans titre", {
        userId: req.user?.id,
      });
      return res.status(400).json({ message: "Le champ 'titre' est requis" });
    }

    logger.info("📝 Tentative de mise à jour du titre global", {
      userId: req.user?.id,
      nouveauTitre: titre,
    });

    // Récupérer l'ancien titre pour l'historique
    const oldTitre = await EntiteeUn.findOne({ attributes: ["titre"] });
    const oldValue = oldTitre ? oldTitre.titre : null;

    // Vérifier l'existence d'enregistrements
    const count = await EntiteeUn.count();

    if (count === 0) {
      // Création initiale si la table est vide
      await EntiteeUn.create({ titre: titre });

      logger.info("✅ Titre initial créé pour EntiteeUn", {
        titre,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ message: "Titre initial créé", titre });
    }

    // Mise à jour globale de la colonne titre
    await EntiteeUn.update({ titre: titre }, { where: {} });

    logger.info("✅ Titre global mis à jour avec succès", {
      ancienTitre: oldValue,
      nouveauTitre: titre,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "update",
      resource: "entiteeUn_titre",
      resource_id: null,
      resource_identifier: "titre global",
      description: `Modification du titre global : ${oldValue || "null"} → ${titre}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      old_data: { titre: oldValue },
      new_data: { titre },
      data: { duration: Date.now() - startTime },
    });

    res.json({ message: "Titre mis à jour pour tous les éléments", titre });
  } catch (err) {
    logger.error("❌ Erreur updateEntiteeUnTitre:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTitre = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("🗑️ Suppression de tous les titres niveau 1", {
      userId: req.user?.id,
    });

    const [count] = await EntiteeUn.update(
      { titre: "" },
      { where: {}, returning: true },
    );

    logger.info("✅ Tous les titres niveau 1 supprimés", {
      count,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "update",
      resource: "entiteeUn",
      resource_id: null,
      resource_identifier: "Tous les titres niveau 1",
      description: `Suppression de tous les titres (${count} entités)`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: { count, duration: Date.now() - startTime },
    });

    res.status(200).json({
      message: `Tous les titres niveau 1 supprimés (${count} entités)`,
      count,
    });
  } catch (err) {
    logger.error("❌ Erreur suppression tous les titres:", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression des titres" });
  }
};

exports.getFunctionsByEntiteeUn = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des fonctions d'une entité niveau 1", {
      entiteeId: id,
      userId: req.user?.id,
    });

    const fonctions = await Fonction.findAll({
      where: { entitee_un_id: id },
    });

    logger.info("✅ Fonctions récupérées", {
      entiteeId: id,
      count: fonctions.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(fonctions);
  } catch (err) {
    logger.error("❌ Erreur getFunctionsByEntiteeUn:", {
      entiteeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur récupération fonctions", error: err.message });
  }
};

exports.updateEntiteeUn = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de modification d'une entité niveau 1", {
      entiteeId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldEntitee = await EntiteeUn.findByPk(id);
    if (!oldEntitee) {
      logger.warn("⚠️ Entité niveau 1 non trouvée", {
        entiteeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "EntiteeUn non trouvé" });
    }

    const oldCopy = oldEntitee.toJSON();
    const payload = req.body;

    await oldEntitee.update(payload);

    const updated = await EntiteeUn.findByPk(id);

    logger.info("✅ Entité niveau 1 modifiée avec succès", {
      entiteeId: id,
      libelle: updated.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "entiteeUn", oldCopy, updated);

    res.status(200).json(updated);
  } catch (err) {
    logger.error("❌ Erreur updateEntiteeUn:", {
      entiteeId: id,
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur mise à jour EntiteeUn", error: err.message });
  }
};

exports.deleteEntiteeUn = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une entité niveau 1", {
      entiteeId: id,
      userId: req.user?.id,
    });

    const ent = await EntiteeUn.findByPk(id);
    if (!ent) {
      logger.warn("⚠️ Entité niveau 1 non trouvée pour suppression", {
        entiteeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "EntiteeUn non trouvé" });
    }

    await ent.destroy();

    logger.info("✅ Entité niveau 1 supprimée avec succès", {
      entiteeId: id,
      libelle: ent.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "entiteeUn", ent);

    res.status(200).json({ message: "EntiteeUn supprimé" });
  } catch (err) {
    logger.error("❌ Erreur deleteEntiteeUn:", {
      entiteeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur suppression EntiteeUn", error: err.message });
  }
};

exports.addTypesToEntiteeUn = entityTypeDocumentService.addTypesToEntity(
  EntiteeUn,
  "EntiteeUn",
  "addTypeDocuments",
);

// Retirer des types de documents d'une direction
exports.removeTypesFromEntiteeUn =
  entityTypeDocumentService.removeTypesFromEntity(
    EntiteeUn,
    "EntiteeUn",
    "removeTypeDocuments",
  );

// Obtenir les types de documents d'une direction
exports.getTypesOfEntiteeUn = entityTypeDocumentService.getTypesOfEntity(
  EntiteeUn,
  "EntiteeUn",
);
