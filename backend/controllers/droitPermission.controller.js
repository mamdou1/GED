// controllers/droitPermission.controller.js
const { Droit, Permission } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

exports.getLibellePermission = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des permissions d'un droit", {
      droitId: id,
      userId: req.user?.id,
    });

    const droit = await Droit.findByPk(id, {
      include: {
        model: Permission,
        as: "Permissions",
        through: { attributes: [] },
      },
    });

    if (!droit) {
      logger.warn("⚠️ Droit introuvable", {
        droitId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Droit introuvable" });
    }

    logger.info("✅ Permissions du droit récupérées", {
      droitId: id,
      count: droit.Permissions?.length || 0,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique (GET avec ID)
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "droit_permission",
      resource_id: id,
      resource_identifier: `${droit.libelle} (${id})`,
      description: `Consultation des permissions du droit #${id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        permissionCount: droit.Permissions?.length || 0,
        duration: Date.now() - startTime,
      },
    });

    res.json(droit.Permissions);
  } catch (error) {
    logger.error("❌ Erreur getLibellePermission:", {
      droitId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.updateLibellePermission = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour des permissions d'un droit", {
      droitId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      logger.warn("⚠️ Format de permissions invalide", {
        droitId: id,
        permissionsType: typeof permissions,
        userId: req.user?.id,
      });
      return res
        .status(400)
        .json({ message: "permissions doit être un tableau" });
    }

    // Récupérer l'ancienne version pour l'historique
    const oldDroit = await Droit.findByPk(id, {
      include: {
        model: Permission,
        as: "Permissions",
        through: { attributes: [] },
      },
    });

    if (!oldDroit) {
      logger.warn("⚠️ Droit introuvable", {
        droitId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Droit introuvable" });
    }

    const oldPermissions = oldDroit.Permissions?.map((p) => p.id) || [];

    await oldDroit.setPermissions(permissions);

    // Récupérer la nouvelle version
    const updatedDroit = await Droit.findByPk(id, {
      include: {
        model: Permission,
        as: "Permissions",
        through: { attributes: [] },
      },
    });

    logger.info("✅ Permissions du droit mises à jour", {
      droitId: id,
      oldCount: oldPermissions.length,
      newCount: permissions.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    const added = permissions.filter((p) => !oldPermissions.includes(p));
    const removed = oldPermissions.filter((p) => !permissions.includes(p));

    const changes = [];
    if (added.length) changes.push(`ajouté: ${added.length} permission(s)`);
    if (removed.length) changes.push(`retiré: ${removed.length} permission(s)`);

    const changesText = changes.length
      ? changes.join(", ")
      : "aucun changement";

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "update",
      resource: "droit_permission",
      resource_id: id,
      resource_identifier: `${updatedDroit.libelle} (${id})`,
      description: `Modification des permissions : ${changesText}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      old_data: { permissionIds: oldPermissions },
      new_data: { permissionIds: permissions },
      data: {
        added: added.length,
        removed: removed.length,
        duration: Date.now() - startTime,
      },
    });

    res.json({ message: "Permissions mises à jour" });
  } catch (error) {
    logger.error("❌ Erreur updateLibellePermission:", {
      droitId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
