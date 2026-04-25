// controllers/rayon.controller.js
const { Rayon, Trave, Salle } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

// Créer une étagère
exports.create = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📝 Tentative de création d'un rayon", {
      userId: req.user?.id,
      body: req.body,
    });

    //const data = await Rayon.create(req.body);
    const data = await Rayon.create({
      ...req.body,
      current_count: 0,
    });

    logger.info("✅ Rayon créé avec succès", {
      rayonId: data.id,
      code: data.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "rayon", data);

    res.status(201).json(data);
  } catch (error) {
    logger.error("❌ Erreur création rayon:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la création de l'étagère",
      error: error.message,
    });
  }
};

// Récupérer toutes les étagères
exports.getRayons = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de tous les rayons", {
      userId: req.user?.id,
      query: req.query,
    });

    const data = await Rayon.findAll({
      include: [
        {
          model: Salle,
          as: "salle",
        },
      ],
    });

    logger.info("✅ Rayons récupérés", {
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "rayon",
        resource_id: null,
        resource_identifier: "liste des rayons",
        description: "Consultation de la liste des rayons",
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
    logger.error("❌ Erreur récupération rayons:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une étagère par ID
exports.getRayonById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Recherche d'un rayon par ID", {
      rayonId: id,
      userId: req.user?.id,
    });

    const data = await Rayon.findByPk(id);
    if (!data) {
      logger.warn("⚠️ Rayon non trouvé", {
        rayonId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Étagère non trouvée" });
    }

    logger.info("✅ Rayon trouvé", {
      rayonId: id,
      code: data.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "rayon",
      resource_id: data.id,
      resource_identifier: `${data.code} (${data.id})`,
      description: `Consultation du rayon #${data.id}`,
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
    logger.error("❌ Erreur recherche rayon:", {
      rayonId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la recherche de l'étagère",
      error: error.message,
    });
  }
};

// Mettre à jour une étagère
exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'un rayon", {
      rayonId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldRayon = await Rayon.findByPk(id);
    if (!oldRayon) {
      logger.warn("⚠️ Rayon non trouvé pour mise à jour", {
        rayonId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        message: "Rayon non trouvé ou aucune modification effectuée",
      });
    }

    const oldCopy = oldRayon.toJSON();
    const { current_count, ...updateData } = req.body;
    const [updated] = await Box.update(updateData, {
      where: { id },
    });
    // const [updated] = await Rayon.update(req.body, {
    //   where: { id },
    // });

    if (updated === 0) {
      logger.warn("⚠️ Aucune modification apportée", {
        rayonId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        message: "Rayon non trouvé ou aucune modification effectuée",
      });
    }

    const updatedRayon = await Rayon.findByPk(id);

    logger.info("✅ Rayon mis à jour avec succès", {
      rayonId: id,
      code: updatedRayon.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "rayon", oldCopy, updatedRayon);

    res.json({
      success: true,
      message: "Étagère mise à jour",
      data: updatedRayon,
    });
  } catch (error) {
    logger.error("❌ Erreur mise à jour rayon:", {
      rayonId: id,
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

// Supprimer une étagère
exports.delete = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un rayon", {
      rayonId: id,
      userId: req.user?.id,
    });

    const rayon = await Rayon.findByPk(id);
    if (!rayon) {
      logger.warn("⚠️ Rayon non trouvé pour suppression", {
        rayonId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Étagère non trouvée" });
    }

    await rayon.destroy();

    logger.info("✅ Rayon supprimé avec succès", {
      rayonId: id,
      code: rayon.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "rayon", rayon);

    res.json({ success: true, message: "Étagère supprimée" });
  } catch (error) {
    logger.error("❌ Erreur suppression rayon:", {
      rayonId: id,
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

// Récupérer tous les cartons (Travees) d'une étagère spécifique
exports.getAllTraveByRayon = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des travées d'un rayon", {
      rayonId: id,
      userId: req.user?.id,
    });

    const data = await Trave.findAll({
      where: { rayon_id: id },
    });

    logger.info("✅ Travées du rayon récupérées", {
      rayonId: id,
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur getAllTraveByRayon:", {
      rayonId: id,
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
