// controllers/salle.controller.js
const { Salle, Rayon, sequelize, Trave, Site, Box } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

exports.create = async (req, res) => {
  const startTime = Date.now();
  const t = await sequelize.transaction();

  try {
    logger.info("📝 Tentative de création d'une salle avec génération", {
      userId: req.user?.id,
      body: req.body,
    });

    const {
      site_id,
      code_salle,
      libelle,
      mb_rayons,
      mb_trave_rayon,
      mb_Box_trave,
      mb_traves_par_rayon,
      sigle_rayon,
      sigle_trave,
    } = req.body;

    // 1. Créer la salle
    const salle = await Salle.create(
      {
        site_id,
        code_salle,
        libelle,
      },
      { transaction: t },
    );

    const nb_box_rayon = mb_Box_trave * mb_traves_par_rayon;

    // 2. Générer les rayons
    for (let i = 1; i <= mb_rayons; i++) {
      const rayonsCode = `${sigle_rayon}${i}`;
      const rayon = await Rayon.create(
        {
          code: rayonsCode,
          salle_id: salle.id,
          capacite_max: nb_box_rayon,
        },
        { transaction: t },
      );

      // 3. Générer les travées pour chaque Rayon
      for (let j = 1; j <= mb_traves_par_rayon; j++) {
        const traveCode = `${sigle_trave}${j}`;
        await Trave.create(
          {
            code: traveCode,
            rayon_id: rayon.id,
            capacite_max: mb_Box_trave,
          },
          { transaction: t },
        );
      }
    }

    await t.commit();

    logger.info("✅ Salle créée avec succès avec génération", {
      salleId: salle.id,
      code: salle.code_salle,
      rayons: mb_rayons,
      traves: mb_rayons * mb_traves_par_rayon,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "salle", salle);

    res.status(201).json(salle);
  } catch (err) {
    if (t) await t.rollback();
    logger.error("❌ Erreur création salle:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur serveur lors de la génération",
      error: err.message,
    });
  }
};

exports.findAll = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de toutes les salles", {
      userId: req.user?.id,
      query: req.query,
    });

    const data = await Salle.findAll({
      include: [
        {
          model: Site,
          as: "site",
        },
      ],
    });

    logger.info("✅ Salles récupérées", {
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "salle",
        resource_id: null,
        resource_identifier: "liste des salles",
        description: "Consultation de la liste des salles",
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
    logger.error("❌ Erreur récupération salles:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.findById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Recherche d'une salle par ID", {
      salleId: id,
      userId: req.user?.id,
    });

    const data = await Salle.findByPk(id);
    if (!data) {
      logger.warn("⚠️ Salle non trouvée", {
        salleId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Salle non trouvée" });
    }

    logger.info("✅ Salle trouvée", {
      salleId: id,
      code: data.code_salle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "salle",
      resource_id: data.id,
      resource_identifier: `${data.libelle} (${data.id})`,
      description: `Consultation de la salle #${data.id}`,
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
    logger.error("❌ Erreur recherche salle:", {
      salleId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'une salle", {
      salleId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldSalle = await Salle.findByPk(id);
    if (!oldSalle) {
      logger.warn("⚠️ Salle non trouvée pour mise à jour", {
        salleId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Salle non trouvée" });
    }

    const oldCopy = oldSalle.toJSON();
    await Salle.update(req.body, { where: { id } });

    const updatedSalle = await Salle.findByPk(id);

    logger.info("✅ Salle mise à jour avec succès", {
      salleId: id,
      code: updatedSalle.code_salle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "salle", oldCopy, updatedSalle);

    res.json({ success: true, data: updatedSalle });
  } catch (error) {
    logger.error("❌ Erreur mise à jour salle:", {
      salleId: id,
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une salle", {
      salleId: id,
      userId: req.user?.id,
    });

    const salle = await Salle.findByPk(id);
    if (!salle) {
      logger.warn("⚠️ Salle non trouvée pour suppression", {
        salleId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Salle non trouvée" });
    }

    await salle.destroy();

    logger.info("✅ Salle supprimée avec succès", {
      salleId: id,
      code: salle.code_salle,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "salle", salle);

    res.json({ success: true });
  } catch (error) {
    logger.error("❌ Erreur suppression salle:", {
      salleId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRayonBySalle = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des rayons d'une salle", {
      salleId: id,
      userId: req.user?.id,
    });

    const data = await Rayon.findAll({
      where: { salle_id: id },
    });

    logger.info("✅ Rayons de la salle récupérés", {
      salleId: id,
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur getAllRayonBySalle:", {
      salleId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};
