// controllers/droit.controller.js
const { Droit, Permission, Agent } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

class DroitController {
  static async create(req, res) {
    const startTime = Date.now();

    try {
      const { libelle } = req.body;
      if (!libelle) {
        logger.warn("⚠️ Tentative de création sans libellé", {
          userId: req.user?.id,
        });
        return res.status(400).json({ message: "Le libelle est requis" });
      }

      logger.info("📝 Tentative de création d'un droit", {
        userId: req.user?.id,
        libelle,
      });

      const dr = await Droit.create({ libelle });

      logger.info("✅ Droit créé avec succès", {
        droitId: dr.id,
        libelle: dr.libelle,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      // Journalisation dans l'historique
      await HistoriqueService.logCreate(req, "droit", dr);

      return res.status(201).json(dr);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        logger.warn("⚠️ Tentative de création d'un droit existant", {
          libelle: req.body.libelle,
          userId: req.user?.id,
        });
        return res.status(400).json({ message: "Droit déjà existant" });
      }
      logger.error("❌ Erreur création droit:", {
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getAll(req, res) {
    const startTime = Date.now();

    try {
      logger.debug("🔍 Récupération de tous les droits", {
        userId: req.user?.id,
        query: req.query,
      });

      const droits = await Droit.findAll({
        order: [["libelle", "ASC"]],
        include: [
          {
            model: Permission,
            as: "Permissions",
            through: { attributes: [] },
            attributes: ["id", "resource", "action"],
          },
        ],
      });

      logger.info("✅ Droits récupérés", {
        count: droits.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      // Journalisation dans l'historique pour les GET avec sidebar
      if (req.headers["x-sidebar-navigation"] === "true") {
        await HistoriqueService.log({
          agent_id: req.user?.id || null,
          action: "read",
          resource: "droit",
          resource_id: null,
          resource_identifier: "liste des droits",
          description: "Consultation de la liste des droits",
          method: req.method,
          path: req.originalUrl,
          status: 200,
          ip: req.ip,
          user_agent: req.headers["user-agent"],
          data: {
            count: droits.length,
            duration: Date.now() - startTime,
          },
        });
      }

      return res.json(droits);
    } catch (err) {
      logger.error("❌ Erreur getAll droits:", {
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getOne(req, res) {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      logger.debug("🔍 Recherche d'un droit par ID", {
        droitId: id,
        userId: req.user?.id,
      });

      const dr = await Droit.findByPk(id, {
        include: [
          {
            model: Permission,
            as: "Permissions",
            through: { attributes: [] },
            attributes: ["id", "resource", "action"],
          },
        ],
      });

      if (!dr) {
        logger.warn("⚠️ Droit non trouvé", {
          droitId: id,
          userId: req.user?.id,
        });
        return res.status(404).json({ message: "Droit non trouvé" });
      }

      logger.info("✅ Droit trouvé", {
        droitId: id,
        libelle: dr.libelle,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      // Journalisation dans l'historique
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "droit",
        resource_id: dr.id,
        resource_identifier: `${dr.libelle} (${dr.id})`,
        description: `Consultation du droit #${dr.id}`,
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          permissionCount: dr.Permissions?.length || 0,
          duration: Date.now() - startTime,
        },
      });

      return res.json(dr);
    } catch (err) {
      logger.error("❌ Erreur getOne droit:", {
        droitId: id,
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async update(req, res) {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      logger.info("📝 Tentative de modification d'un droit", {
        droitId: id,
        userId: req.user?.id,
        body: req.body,
      });

      const oldDroit = await Droit.findByPk(id);
      if (!oldDroit) {
        logger.warn("⚠️ Droit non trouvé pour modification", {
          droitId: id,
          userId: req.user?.id,
        });
        return res.status(404).json({ message: "Droit non trouvé" });
      }

      // ✅ Créer une COPIE de l'ancien objet pour l'historique
      const oldDroitCopy = oldDroit.toJSON(); // ou { ...oldDroit.get() }

      const payload = req.body;
      await oldDroit.update(payload);

      // Récupérer la version modifiée
      const updatedDroit = await Droit.findByPk(id);

      logger.info("✅ Droit modifié avec succès", {
        droitId: id,
        oldLibelle: oldDroitCopy.libelle,
        newLibelle: updatedDroit.libelle,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      // Journalisation dans l'historique avec la COPIE
      await HistoriqueService.logUpdate(
        req,
        "droit",
        oldDroitCopy,
        updatedDroit,
      );

      return res.json(updatedDroit);
    } catch (err) {
      // ... gestion d'erreur
    }
  }

  static async delete(req, res) {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      logger.info("🗑️ Tentative de suppression d'un droit", {
        droitId: id,
        userId: req.user?.id,
      });

      const droit = await Droit.findByPk(id);
      if (!droit) {
        logger.warn("⚠️ Droit non trouvé pour suppression", {
          droitId: id,
          userId: req.user?.id,
        });
        return res.status(404).json({ message: "Droit non trouvé" });
      }

      await Droit.destroy({ where: { id } });

      logger.info("✅ Droit supprimé avec succès", {
        droitId: id,
        libelle: droit.libelle,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      // Journalisation dans l'historique
      await HistoriqueService.logDelete(req, "droit", droit);

      return res.json({ message: "Droit supprimé" });
    } catch (err) {
      logger.error("❌ Erreur delete droit:", {
        droitId: id,
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async getAgentByDroit(req, res) {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      logger.debug("🔍 Récupération des agents d'un droit", {
        droitId: id,
        userId: req.user?.id,
      });

      const droit = await Droit.findByPk(id, {
        include: [
          {
            model: Agent,
            as: "agents",
          },
        ],
      });

      if (!droit) {
        logger.warn("⚠️ Droit non trouvé", {
          droitId: id,
          userId: req.user?.id,
        });
        return res.status(404).json({ message: "Droit ou profil non trouvé" });
      }

      logger.info("✅ Agents du droit récupérés", {
        droitId: id,
        count: droit.agents?.length || 0,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      // Journalisation dans l'historique (GET avec ID)
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "droit_agent",
        resource_id: id,
        resource_identifier: `${droit.libelle} (${id})`,
        description: `Consultation des agents du droit #${id}`,
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          agentCount: droit.agents?.length || 0,
          duration: Date.now() - startTime,
        },
      });

      return res.status(200).json(droit.agents);
    } catch (err) {
      logger.error("❌ Erreur getAgentByDroit:", {
        droitId: id,
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }
}

module.exports = DroitController;
