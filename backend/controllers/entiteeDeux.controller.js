// controllers/entiteeDeux.controller.js
const { Fonction, EntiteeUn, EntiteeDeux, EntiteeTrois } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const entityTypeDocumentService = require("../services/entityTypeDocument.service");

exports.createEntiteeDeux = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📝 Tentative de création d'une entité de niveau 2", {
      userId: req.user?.id,
      body: req.body,
    });

    // 1. Trouver le titre utilisé par les autres éléments
    const { libelle, entitee_un_id } = req.body;

    const count = await EntiteeDeux.count();
    // 1. Trouver le titre utilisé par les autres éléments
    const exemple = await EntiteeDeux.findOne({ attributes: ["titre"] });
    logger.info("🔍 Exemple trouvé:", exemple);

    const titreGlobal = exemple?.titre || "Défaut";
    logger.info("🎯 Titre global:", titreGlobal);

    const prefixe = titreGlobal.trim().slice(0, 3).toUpperCase();

    const nextNumber = count + 1;
    const paddedNumber = nextNumber.toString().padStart(3, "0");
    const code_pieces = `${prefixe}-${paddedNumber}`;

    // 2. Créer l'élément avec le titre récupéré
    const entitee_deux = await EntiteeDeux.create({
      code: code_pieces,
      libelle,
      titre: titreGlobal,
      entitee_un_id,
    });

    logger.info("✅ Entité de niveau 2 créée avec succès", {
      entiteeId: entitee_deux.id,
      libelle: entitee_deux.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "entiteeDeux", entitee_deux);

    res.status(201).json(entitee_deux);
  } catch (err) {
    logger.error("❌ Erreur création entiteeDeux:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur création entitee_deux", error: err.message });
  }
};

exports.getAllEntiteeDeux = async (req, res) => {
  const startTime = Date.now();

  try {
    const entitee_deux = await EntiteeDeux.findAll({
      include: [
        {
          model: EntiteeUn,
          as: "entitee_un",
          attributes: ["id", "libelle"],
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          attributes: ["id", "libelle"],
        },
      ],
    });

    res.json(entitee_deux);
  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération entitee_deux",
      error: err.message,
    });
  }
};

exports.getEntiteeDeuxTitre = async (req, res) => {
  try {
    const entitee = await EntiteeDeux.findOne({ attributes: ["titre"] });

    if (!entitee) {
      return res.status(200).json({ titre: "" });
    }

    res.status(200).json({ titre: entitee.titre || "" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEntiteeDeuxTitre = async (req, res) => {
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
    const oldTitre = await EntiteeDeux.findOne({ attributes: ["titre"] });
    const oldValue = oldTitre ? oldTitre.titre : null;

    // Vérifier l'existence d'enregistrements
    const count = await EntiteeDeux.count();

    if (count === 0) {
      // Création initiale si la table est vide
      await EntiteeDeux.create({
        titre: titre,
        code: "INIT",
        libelle: "Premier élément EntiteeDeux",
      });

      logger.info("✅ Titre initial créé pour EntiteeDeux", {
        titre,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({
        message: "Titre initial créé pour EntiteeDeux",
        titre,
      });
    }

    // Mise à jour globale de la colonne titre
    await EntiteeDeux.update({ titre: titre }, { where: {} });

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
      resource: "entiteeDeux_titre",
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

    res.json({
      message: "Titre mis à jour pour tous les éléments de EntiteeDeux",
      titre,
    });
  } catch (err) {
    logger.error("❌ Erreur updateEntiteeDeuxTitre:", {
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
    logger.info("🗑️ Suppression de tous les titres niveau 2", {
      userId: req.user?.id,
    });

    const [count] = await EntiteeDeux.update(
      { titre: "" },
      { where: {}, returning: true },
    );

    logger.info("✅ Tous les titres niveau 2 supprimés", {
      count,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "update",
      resource: "entiteeDeux",
      resource_id: null,
      resource_identifier: "Tous les titres niveau 2",
      description: `Suppression de tous les titres (${count} entités)`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: { count, duration: Date.now() - startTime },
    });

    res.status(200).json({
      message: `Tous les titres niveau 2 supprimés (${count} entités)`,
      count,
    });
  } catch (err) {
    logger.error("❌ Erreur suppression tous les titres:", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression des titres" });
  }
};

exports.getEntiteeDeuxByEntiteeUn = async (req, res) => {
  const startTime = Date.now();
  const { entiteeUnId } = req.params;

  try {
    logger.debug("🔍 Récupération des entités niveau 2 par entité niveau 1", {
      entiteeUnId,
      userId: req.user?.id,
    });

    const entitee_deux = await EntiteeDeux.findAll({
      where: { entitee_un_id: entiteeUnId },
    });

    logger.info("✅ Entités niveau 2 récupérées", {
      entiteeUnId,
      count: entitee_deux.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(entitee_deux);
  } catch (err) {
    logger.error("❌ Erreur getEntiteeDeuxByEntiteeUn:", {
      entiteeUnId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur récupération entitee_deux",
      error: err.message,
    });
  }
};

exports.getFunctionsByEntiteeDeux = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des fonctions d'une entité niveau 2", {
      entiteeId: id,
      userId: req.user?.id,
    });

    const fonctions = await Fonction.findAll({
      where: { entitee_deux_id: id },
    });

    logger.info("✅ Fonctions récupérées", {
      entiteeId: id,
      count: fonctions.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(fonctions);
  } catch (err) {
    logger.error("❌ Erreur getFunctionsByEntiteeDeux:", {
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

exports.updateEntiteeDeux = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de modification d'une entité niveau 2", {
      entiteeId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldEntitee = await EntiteeDeux.findByPk(id);
    if (!oldEntitee) {
      logger.warn("⚠️ Entité niveau 2 non trouvée", {
        entiteeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "entitee_deux non trouvé" });
    }

    const oldCopy = oldEntitee.toJSON();
    const payload = req.body;

    await oldEntitee.update(payload);

    const updated = await EntiteeDeux.findByPk(id, {
      include: [{ model: EntiteeUn, as: "entitee_un" }],
    });

    logger.info("✅ Entité niveau 2 modifiée avec succès", {
      entiteeId: id,
      libelle: updated.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "entiteeDeux", oldCopy, updated);

    res.status(200).json(updated);
  } catch (err) {
    logger.error("❌ Erreur updateEntiteeDeux:", {
      entiteeId: id,
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur mise à jour entitee_deux", error: err.message });
  }
};

exports.deleteEntiteeDeux = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une entité niveau 2", {
      entiteeId: id,
      userId: req.user?.id,
    });

    const ent = await EntiteeDeux.findByPk(id);
    if (!ent) {
      logger.warn("⚠️ Entité niveau 2 non trouvée pour suppression", {
        entiteeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "entitee_deux non trouvé" });
    }

    await ent.destroy();

    logger.info("✅ Entité niveau 2 supprimée avec succès", {
      entiteeId: id,
      libelle: ent.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "entiteeDeux", ent);

    res.status(200).json({ message: "entitee_deux supprimé" });
  } catch (err) {
    logger.error("❌ Erreur deleteEntiteeDeux:", {
      entiteeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur suppression entitee_deux", error: err.message });
  }
};

exports.addTypesToEntiteeDeux = entityTypeDocumentService.addTypesToEntity(
  EntiteeDeux,
  "EntiteeDeux",
  "addTypeDocuments",
);

// Retirer des types de documents d'une direction
exports.removeTypesFromEntiteeDeux =
  entityTypeDocumentService.removeTypesFromEntity(
    EntiteeDeux,
    "EntiteeDeux",
    "removeTypeDocuments",
  );

// Obtenir les types de documents d'une direction
exports.getTypesOfEntiteeDeux = entityTypeDocumentService.getTypesOfEntity(
  EntiteeDeux,
  "EntiteeDeux",
);
