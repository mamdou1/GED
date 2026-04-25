// controllers/trave.controller.js
const { Trave, Box, Rayon } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

// Créer une travée
exports.create = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📝 Tentative de création d'une travée", {
      userId: req.user?.id,
      body: req.body,
    });

    //const data = await Rayon.create(req.body);
    const data = await Trave.create({
      ...req.body,
      current_count: 0,
    });

    logger.info("✅ Travée créée avec succès", {
      traveId: data.id,
      code: data.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "trave", data);

    res.status(201).json(data);
  } catch (error) {
    logger.error("❌ Erreur création travée:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la création de la travée",
      error: error.message,
    });
  }
};

// Récupérer toutes les travées
exports.findAll = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de toutes les travées", {
      userId: req.user?.id,
      query: req.query,
    });

    const data = await Trave.findAll({
      include: [
        {
          model: Rayon,
          as: "rayon",
        },
      ],
    });

    logger.info("✅ Travées récupérées", {
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "trave",
        resource_id: null,
        resource_identifier: "liste des travées",
        description: "Consultation de la liste des travées",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: data.length,
          duration: Date.now() - startTime,
        },
      });
    }

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur récupération travées:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la récupération des travées",
      error: error.message,
    });
  }
};

// Récupérer une travée par ID
exports.findById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Recherche d'une travée par ID", {
      traveId: id,
      userId: req.user?.id,
    });

    const data = await Trave.findByPk(id);
    if (!data) {
      logger.warn("⚠️ Travée non trouvée", {
        traveId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Travée non trouvée" });
    }

    logger.info("✅ Travée trouvée", {
      traveId: id,
      code: data.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "trave",
      resource_id: data.id,
      resource_identifier: `${data.code} (${data.id})`,
      description: `Consultation de la travée #${data.id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
      },
    });

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur recherche travée:", {
      traveId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la recherche de la travée",
      error: error.message,
    });
  }
};

// Mettre à jour une travée
exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'une travée", {
      traveId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldTrave = await Trave.findByPk(id);
    if (!oldTrave) {
      logger.warn("⚠️ Travée non trouvée pour mise à jour", {
        traveId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Travée non trouvée" });
    }

    const oldCopy = oldTrave.toJSON();
    const { current_count, ...updateData } = req.body;
    const [updated] = await Box.update(updateData, {
      where: { id },
    });
    // const [updated] = await Trave.update(req.body, {
    //   where: { id },
    // });

    if (updated === 0) {
      logger.warn("⚠️ Aucune modification apportée", {
        traveId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        message: "Travée non trouvée ou aucune modification effectuée",
      });
    }

    const updatedTrave = await Trave.findByPk(id);

    logger.info("✅ Travée mise à jour avec succès", {
      traveId: id,
      code: updatedTrave.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "trave", oldCopy, updatedTrave);

    res.json({
      success: true,
      message: "Travée mise à jour",
      data: updatedTrave,
    });
  } catch (error) {
    logger.error("❌ Erreur mise à jour travée:", {
      traveId: id,
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};

exports.addBoxToTrve = async (req, res) => {
  const startTime = Date.now();
  const { boxId, traveId } = req.params;

  try {
    logger.info("📥 Tentative d'ajout de document dans box", {
      boxId,
      documentId,
      traveId,
      userId: req.user?.id,
    });

    const box = await Box.findByPk(boxId);
    const trave = await Trave.findByPk(traveId);

    if (!box || !trave) {
      return res.status(404).json({ message: "Box ou Travé introuvable" });
    }

    // Vérification Capacité
    if (trave.current_count >= trave.capacite_max) {
      return res
        .status(400)
        .json({ message: "Capacité maximale atteinte pour ce travé" });
    }

    trave.current_count += 1;

    // 🔹 Mise à jour du status
    if (trave.current_count === 0) {
      trave.status = "LIBRE";
    } else if (trave.current_count >= box.capacite_max) {
      trave.status = "PLIEN";
    } else if (trave.current_count >= 1) {
      trave.status = "OCCUPE";
    }

    await trave.save();
    await box.save();

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "box", box);

    res.json({
      success: true,
      current_count: box.current_count,
      status: box.status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout du document",
      error: error.message,
    });
  }
};

exports.retireBoxToTrve = async (req, res) => {
  const startTime = Date.now();
  const { boxId } = req.params;

  try {
    const box = await Box.findByPk(boxId);
    if (!box || !box.trave_id) {
      return res
        .status(404)
        .json({ message: "Box non trouvé ou déjà hors box" });
    }

    const trave = await Trave.findByPk(box.trave_id);
    if (trave) {
      trave.current_count = Math.max(0, box.current_count - 1);
      if (trave.current_count === 0) {
        trave.type_document_id = null;
        trave.status = "LIBRE";
      } else if (trave.current_count >= trave.capacite_max) {
        trave.status = "PLIEN";
      } else {
        trave.status = "OCCUPE";
      }
      await trave.save();
    }

    box.trave_id = null;
    await box.save();

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "trave", trave);

    res.json({
      success: true,
      message: "Box retiré avec succès",
      status: box?.status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du retrait du box",
      error: error.message,
    });
  }
};

// Supprimer une travée
exports.delete = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une travée", {
      traveId: id,
      userId: req.user?.id,
    });

    const trave = await Trave.findByPk(id);
    if (!trave) {
      logger.warn("⚠️ Travée non trouvée pour suppression", {
        traveId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Travée non trouvée" });
    }

    await trave.destroy();

    logger.info("✅ Travée supprimée avec succès", {
      traveId: id,
      code: trave.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "trave", trave);

    res.json({ success: true, message: "Travée supprimée" });
  } catch (error) {
    logger.error("❌ Erreur suppression travée:", {
      traveId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression", error: error.message });
  }
};

// Récupérer tous les boxes d'une travée spécifique
exports.getAllBoxByTrave = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des boxes d'une travée", {
      traveId: id,
      userId: req.user?.id,
    });

    const data = await Box.findAll({
      where: { trave_id: id },
    });

    logger.info("✅ Boxes de la travée récupérés", {
      traveId: id,
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur getAllBoxByTrave:", {
      traveId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la récupération des cartons",
      error: error.message,
    });
  }
};
