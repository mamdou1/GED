// controllers/entiteeTrois.controller.js
const { Fonction, EntiteeUn, EntiteeDeux, EntiteeTrois } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const entityTypeDocumentService = require("../services/entityTypeDocument.service");

exports.createEntiteeTrois = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📝 Tentative de création d'une entité de niveau 3", {
      userId: req.user?.id,
      body: req.body,
    });

    const { libelle, entitee_deux_id } = req.body;
    function enleverAccents(str) {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    const count = await EntiteeTrois.count();
    const exemple = await EntiteeTrois.findOne({ attributes: ["titre"] });
    logger.info("🔍 Exemple trouvé:", exemple);

    const titreGlobal = exemple?.titre || "Défaut";
    logger.info("🎯 Titre global:", titreGlobal);

    const prefixe = titreGlobal.trim().slice(0, 3).toUpperCase();
    const sansAccents = enleverAccents(prefixe);

    const nextNumber = count + 1;
    const paddedNumber = nextNumber.toString().padStart(3, "0");
    const code_pieces = `${sansAccents}-${paddedNumber}`;

    // 1. Trouver le titre utilisé par les autres éléments

    // 2. Créer l'élément avec le titre récupéré
    const entitee_trois = await EntiteeTrois.create({
      code: code_pieces,
      libelle,
      titre: titreGlobal,
      entitee_deux_id,
    });

    logger.info("✅ Entité de niveau 3 créée avec succès", {
      entiteeId: entitee_trois.id,
      libelle: entitee_trois.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "entiteeTrois", entitee_trois);

    res.status(201).json(entitee_trois);
  } catch (err) {
    logger.error("❌ Erreur création entiteeTrois:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur création EntiteeTrois", error: err.message });
  }
};

exports.getAllEntiteeTrois = async (req, res) => {
  const startTime = Date.now();

  try {
    const entitee_trois = await EntiteeTrois.findAll({
      include: [
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle"],
          include: [
            {
              model: EntiteeUn,
              as: "entitee_un",
              attributes: ["id", "libelle"],
            },
          ],
        },
      ],
    });

    res.json(entitee_trois);
  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération EntiteeTrois",
      error: err.message,
    });
  }
};

exports.getEntiteeTroisTitre = async (req, res) => {
  const startTime = Date.now();

  try {
    // Récupérer la première entité (ou null si aucune)
    const entitee = await EntiteeTrois.findOne({ attributes: ["titre"] });

    // ✅ Gérer le cas où aucune entité n'existe
    if (!entitee) {
      return res.status(200).json({ titre: "" }); // Retourner une chaîne vide
    }

    res.status(200).json({ titre: entitee.titre || "" }); // Si titre est null, retourner ""
  } catch (err) {
    console.error("❌ Erreur getEntiteeTroisTitre:", err);
    res.status(500).json({
      message: "Erreur lors de la récupération du titre",
      error: err.message,
    });
  }
};

exports.updateEntiteeTroisTitre = async (req, res) => {
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
    const oldTitre = await EntiteeTrois.findOne({ attributes: ["titre"] });
    const oldValue = oldTitre ? oldTitre.titre : null;

    // Vérifier l'existence d'enregistrements
    const count = await EntiteeTrois.count();

    if (count === 0) {
      // Création initiale si la table est vide
      await EntiteeTrois.create({
        titre: titre,
        code: "INIT",
        libelle: "Premier élément EntiteeTrois",
      });

      logger.info("✅ Titre initial créé pour EntiteeTrois", {
        titre,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({
        message: "Titre initial créé pour EntiteeTrois",
        titre,
      });
    }

    // Mise à jour globale de la colonne titre
    await EntiteeTrois.update({ titre: titre }, { where: {} });

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
      resource: "entiteeTrois_titre",
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
      message: "Titre mis à jour pour tous les éléments de EntiteeTrois",
      titre,
    });
  } catch (err) {
    logger.error("❌ Erreur updateEntiteeTroisTitre:", {
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
    logger.info("🗑️ Suppression de tous les titres niveau 3", {
      userId: req.user?.id,
    });

    const [count] = await EntiteeTrois.update(
      { titre: "" },
      { where: {}, returning: true },
    );

    logger.info("✅ Tous les titres niveau 3 supprimés", {
      count,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "update",
      resource: "entiteeTrois",
      resource_id: null,
      resource_identifier: "Tous les titres niveau 3",
      description: `Suppression de tous les titres (${count} entités)`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: { count, duration: Date.now() - startTime },
    });

    res.status(200).json({
      message: `Tous les titres niveau 3 supprimés (${count} entités)`,
      count,
    });
  } catch (err) {
    logger.error("❌ Erreur suppression tous les titres:", err);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression des titres" });
  }
};

exports.getEntiteeTroisByEntiteeDeux = async (req, res) => {
  const startTime = Date.now();
  const { entiteeDeuxId } = req.params;

  try {
    logger.debug("🔍 Récupération des entités niveau 3 par entité niveau 2", {
      entiteeDeuxId,
      userId: req.user?.id,
    });

    const entitee_trois = await EntiteeTrois.findAll({
      where: { entitee_deux_id: entiteeDeuxId },
    });

    logger.info("✅ Entités niveau 3 récupérées", {
      entiteeDeuxId,
      count: entitee_trois.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(entitee_trois);
  } catch (err) {
    logger.error("❌ Erreur getEntiteeTroisByEntiteeDeux:", {
      entiteeDeuxId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur récupération EntiteeTrois",
      error: err.message,
    });
  }
};

exports.getFunctionsByEntiteeTrois = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des fonctions d'une entité niveau 3", {
      entiteeId: id,
      userId: req.user?.id,
    });

    const fonctions = await Fonction.findAll({
      where: { entitee_trois_id: id },
    });

    logger.info("✅ Fonctions récupérées", {
      entiteeId: id,
      count: fonctions.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(fonctions);
  } catch (err) {
    logger.error("❌ Erreur getFunctionsByEntiteeTrois:", {
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

exports.updateEntiteeTrois = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de modification d'une entité niveau 3", {
      entiteeId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldEntitee = await EntiteeTrois.findByPk(id);
    if (!oldEntitee) {
      logger.warn("⚠️ Entité niveau 3 non trouvée", {
        entiteeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "EntiteeTrois non trouvé" });
    }

    const oldCopy = oldEntitee.toJSON();
    const payload = req.body;

    await oldEntitee.update(payload);

    const updated = await EntiteeTrois.findByPk(id, {
      include: [{ model: EntiteeDeux, as: "entitee_deux" }],
    });

    logger.info("✅ Entité niveau 3 modifiée avec succès", {
      entiteeId: id,
      libelle: updated.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "entiteeTrois", oldCopy, updated);

    res.status(200).json(updated);
  } catch (err) {
    logger.error("❌ Erreur updateEntiteeTrois:", {
      entiteeId: id,
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur mise à jour entitee_trois",
      error: err.message,
    });
  }
};

exports.deleteEntiteeTrois = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une entité niveau 3", {
      entiteeId: id,
      userId: req.user?.id,
    });

    const ent = await EntiteeTrois.findByPk(id);
    if (!ent) {
      logger.warn("⚠️ Entité niveau 3 non trouvée pour suppression", {
        entiteeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "EntiteeTrois non trouvé" });
    }

    await ent.destroy();

    logger.info("✅ Entité niveau 3 supprimée avec succès", {
      entiteeId: id,
      libelle: ent.libelle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "entiteeTrois", ent);

    res.status(200).json({ message: "EntiteeTrois supprimé" });
  } catch (err) {
    logger.error("❌ Erreur deleteEntiteeTrois:", {
      entiteeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur suppression EntiteeTrois", error: err.message });
  }
};

exports.addTypesToEntiteeTrois = entityTypeDocumentService.addTypesToEntity(
  EntiteeTrois,
  "EntiteeTrois",
  "addTypeDocuments",
);

// Retirer des types de documents d'une direction
exports.removeTypesFromEntiteeTrois =
  entityTypeDocumentService.removeTypesFromEntity(
    EntiteeTrois,
    "EntiteeTrois",
    "removeTypeDocuments",
  );

// Obtenir les types de documents d'une direction
exports.getTypesOfEntiteeTrois = entityTypeDocumentService.getTypesOfEntity(
  EntiteeTrois,
  "EntiteeTrois",
);
