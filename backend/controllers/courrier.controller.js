// backend/controllers/courrier.controller.js
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const CourrierService = require("../services/CourrierService");

class CourrierController {

  // ===================== GET ALL =====================
  static async getAll(req, res) {
    const startTime = Date.now();
    try {
      logger.debug("🔍 Récupération de tous les courriers", {
        userId: req.user?.id,
        filters: req.query,
      });

      const filters = { ...req.query };
      if (filters.statut) {
        filters.statut = filters.statut.split(",").map(s => s.trim()).filter(s => s);
      }
      if (filters.type) filters.type = filters.type.toUpperCase();

      const courriers = await CourrierService.getAll(filters, req.user);

      logger.info("✅ Courriers récupérés", {
        count: courriers.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      if (req.headers["x-sidebar-navigation"] === "true") {
        await HistoriqueService.log({
          agent_id: req.user?.id || null,
          action: "read",
          resource: "courrier",
          resource_id: null,
          resource_identifier: "liste des courriers",
          description: "Consultation de la liste des courriers",
          method: req.method,
          path: req.originalUrl,
          status: 200,
          ip: req.ip,
          user_agent: req.headers["user-agent"],
          data: { count: courriers.length, duration: Date.now() - startTime },
        });
      }

      return res.json({
        success: true,
        data: courriers,
        count: courriers.length,
      });
    } catch (err) {
      logger.error("❌ Erreur getAll courriers:", {
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      return res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
  }

  // ===================== GET BY ID =====================
  static async getById(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;

    try {
      logger.debug("🔍 Récupération courrier par ID", { courrierId: id, userId: req.user?.id });

      const courrier = await CourrierService.getById(id, req.user);

      logger.info("✅ Courrier trouvé", {
        courrierId: id,
        reference: courrier.reference,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "courrier",
        resource_id: id,
        resource_identifier: courrier.reference,
        description: `Consultation du courrier ${courrier.reference}`,
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
      });

      return res.json({ success: true, data: courrier });
    } catch (err) {
      logger.error("❌ Erreur getById courrier:", { error: err.message, userId: req.user?.id });
      return res.status(403).json({ success: false, message: err.message });
    }
  }

  // ===================== CREATE =====================
  static async create(req, res) {
    const startTime = Date.now();
    try {
      const agentId = req.user?.id;
      const data = req.body;

      logger.info("📝 Tentative création courrier", { userId: agentId, type: data.type });

      const courrierId = await CourrierService.create(data, agentId, req.user);

      const newCourrier = await CourrierService.getById(courrierId, req.user);

      if (req.files && req.files.length > 0) {
        await CourrierService.addPiecesJointes(courrierId, req.files);
      }

      logger.info("✅ Courrier créé", {
        courrierId,
        reference: newCourrier.reference,
        userId: agentId,
        duration: Date.now() - startTime,
      });

      await HistoriqueService.logCreate(req, "courrier", newCourrier, "reference");

      return res.status(201).json({
        success: true,
        message: "Courrier créé avec succès",
        data: newCourrier,
      });
    } catch (err) {
      logger.error("❌ Erreur création courrier:", { error: err.message, userId: req.user?.id });
      return res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
  }

  // ===================== VALIDER =====================
  static async valider(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;

    try {
      const success = await CourrierService.valider(id, req.user?.id);
      if (!success) {
        return res.status(400).json({ success: false, message: "Impossible de valider ce courrier" });
      }

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      return res.json({ success: true, message: "Courrier validé avec succès", data: courrier });
    } catch (err) {
      logger.error("❌ Erreur validation:", { error: err.message });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== REJETER =====================
  static async rejeter(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { motif } = req.body;

    try {
      const success = await CourrierService.rejeter(id, req.user?.id, motif);
      if (!success) {
        return res.status(400).json({ success: false, message: "Impossible de rejeter ce courrier" });
      }

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      return res.json({ success: true, message: "Courrier rejeté avec succès", data: courrier });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== ATTRIBUER =====================
  static async attribuer(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { destinataire_idagent, commentaire, instructions, date_limite_traitement } = req.body;

    try {
      await CourrierService.attribuer(id, destinataire_idagent, commentaire, instructions, date_limite_traitement);

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      return res.json({ success: true, message: "Courrier attribué avec succès", data: courrier });
    } catch (err) {
      logger.error("❌ Erreur attribution:", { error: err.message });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== TRAITER =====================
  static async traiter(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { action, nouveau_statut, motif } = req.body;

    try {
      await CourrierService.traiter(id, req.user?.id, action, nouveau_statut, motif);

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      return res.json({ success: true, message: `Action ${action} effectuée`, data: courrier });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== GET MES ATTRIBUÉS =====================
  static async getMesAttribues(req, res) {
    const startTime = Date.now();
    try {
      const courriers = await CourrierService.getMesAttribues(req.user?.id);

      logger.info("✅ Mes courriers attribués récupérés", {
        count: courriers.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ success: true, data: courriers, count: courriers.length });
    } catch (err) {
      logger.error("❌ Erreur getMesAttribues:", { error: err.message });
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }

  // ===================== SEARCH =====================
  static async search(req, res) {
    const startTime = Date.now();
    const { q, ...filters } = req.query;

    try {
      if (!q) {
        return res.status(400).json({ success: false, message: "Terme de recherche requis" });
      }

      const results = await CourrierService.search(q, filters, req.user);

      logger.info("✅ Recherche courriers effectuée", {
        term: q,
        count: results.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ success: true, data: results, count: results.length });
    } catch (err) {
      logger.error("❌ Erreur search courriers:", { error: err.message });
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }

  // ===================== STATISTIQUES =====================
  static async getStatistiques(req, res) {
    const startTime = Date.now();
    try {
      const stats = await CourrierService.getStatistiques(req.query);
      logger.info("✅ Statistiques courriers récupérées", {
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      return res.json({ success: true, data: stats });
    } catch (err) {
      logger.error("❌ Erreur getStatistiques:", { error: err.message });
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }

  // ===================== AUDIT =====================
  static async getAudit(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;

    try {
      const audit = await CourrierService.getAudit(id, req.user);
      return res.json({ success: true, data: audit, count: audit.length });
    } catch (err) {
      logger.error("❌ Erreur getAudit:", { error: err.message });
      return res.status(403).json({ success: false, message: err.message });
    }
  }

  // ===================== COURRIERS EN RETARD =====================
  static async getCourriersEnRetard(req, res) {
    const startTime = Date.now();
    try {
      const courriers = await CourrierService.getCourriersEnRetard(req.user);

      logger.info("✅ Courriers en retard récupérés", {
        count: courriers.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ success: true, data: courriers, count: courriers.length });
    } catch (err) {
      logger.error("❌ Erreur getCourriersEnRetard:", { error: err.message });
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }

  // ===================== GET PIECES JOINTES =====================
  static async getPiecesJointes(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    try {
      const pieces = await CourrierService.getPiecesJointes(id);
      return res.json({ success: true, data: pieces });
    } catch (err) {
      logger.error("❌ Erreur getPiecesJointes:", { error: err.message });
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }

  // ===================== TRANSFERT INTER-DIRECTION =====================
  static async transferer(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { nouvelleDirectionId, motif } = req.body;

    try {
      await CourrierService.transfererVersAutreDirection(id, nouvelleDirectionId, req.user, motif);

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      return res.json({ success: true, message: "Courrier transféré avec succès", data: courrier });
    } catch (err) {
      logger.error("❌ Erreur transfert:", { error: err.message });
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = CourrierController;