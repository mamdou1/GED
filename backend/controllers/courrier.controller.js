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
      const status = err.message.includes("refusé") || err.message.includes("non trouvé") ? 403 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  // ===================== CREATE =====================
  static async create(req, res) {
    const startTime = Date.now();
    try {
      const agentId = req.user?.id;
      const data = req.body;

      logger.info("📝 Tentative création courrier", { userId: agentId, type: data.type });

      const courrier = await CourrierService.create(data, agentId, req.user);

      if (req.files && req.files.length > 0) {
        await CourrierService.addPiecesJointes(courrier.idcourrier, req.files);
      }

      const newCourrier = await CourrierService.getById(courrier.idcourrier, req.user);

      logger.info("✅ Courrier créé", {
        courrierId: newCourrier.idcourrier,
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

      logger.info("✅ Courrier validé", {
        courrierId: id,
        reference: courrier.reference,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ success: true, message: "Courrier validé avec succès", data: courrier });
    } catch (err) {
      logger.error("❌ Erreur validation:", { error: err.message, userId: req.user?.id });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== REJETER =====================
  static async rejeter(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { motif } = req.body;

    try {
      if (!motif || !motif.trim()) {
        return res.status(400).json({ success: false, message: "Le motif de rejet est obligatoire" });
      }

      const success = await CourrierService.rejeter(id, req.user?.id, motif);
      if (!success) {
        return res.status(400).json({ success: false, message: "Impossible de rejeter ce courrier" });
      }

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      logger.info("❌ Courrier rejeté", {
        courrierId: id,
        reference: courrier.reference,
        motif,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ success: true, message: "Courrier rejeté avec succès", data: courrier });
    } catch (err) {
      logger.error("❌ Erreur rejet:", { error: err.message, userId: req.user?.id });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== ATTRIBUER =====================
  static async attribuer(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { destinataire_idagent, commentaire, instructions, date_limite_traitement } = req.body;

    try {
      if (!destinataire_idagent) {
        return res.status(400).json({ success: false, message: "L'agent destinataire est obligatoire" });
      }
      if (!date_limite_traitement) {
        return res.status(400).json({ success: false, message: "La date limite de traitement est obligatoire" });
      }

      await CourrierService.attribuer(id, destinataire_idagent, commentaire, instructions, date_limite_traitement);

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      logger.info("✅ Courrier attribué à un agent", {
        courrierId: id,
        reference: courrier.reference,
        destinataire_idagent,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ success: true, message: "Courrier attribué avec succès", data: courrier });
    } catch (err) {
      logger.error("❌ Erreur attribution:", { error: err.message, userId: req.user?.id });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== ATTRIBUER À UNE ENTITÉ =====================
  static async attribuerAEntite(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { entiteeId, entiteeType, motif } = req.body;

    try {
      if (!entiteeId) {
        return res.status(400).json({ success: false, message: "L'ID de l'entité est obligatoire" });
      }
      if (!entiteeType) {
        return res.status(400).json({ success: false, message: "Le type d'entité est obligatoire" });
      }

      const result = await CourrierService.attribuerAEntite(id, entiteeId, entiteeType, req.user, motif);

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      logger.info("✅ Courrier attribué à une entité", {
        courrierId: id,
        reference: courrier.reference,
        entiteeId,
        entiteeType,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ 
        success: true, 
        message: result.message || `Courrier attribué avec succès à l'entité`, 
        data: courrier 
      });
    } catch (err) {
      logger.error("❌ Erreur attribution à entité:", { error: err.message, userId: req.user?.id });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== ATTRIBUER MULTIPLE =====================
  static async attribuerMultiple(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { attributions } = req.body;

    try {
      if (!attributions || !Array.isArray(attributions) || attributions.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "La liste des attributions est obligatoire" 
        });
      }

      const result = await CourrierService.attribuerMultiple(id, attributions, req.user);

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      logger.info("✅ Attributions multiples effectuées", {
        courrierId: id,
        count: attributions.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ 
        success: true, 
        message: `${attributions.length} attribution(s) effectuée(s) avec succès`, 
        data: courrier,
        results: result.results
      });
    } catch (err) {
      logger.error("❌ Erreur attributions multiples:", { error: err.message, userId: req.user?.id });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== TRAITER =====================
  static async traiter(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { action, nouveau_statut, motif } = req.body;

    try {
      if (!action) {
        return res.status(400).json({ success: false, message: "L'action est obligatoire" });
      }

      await CourrierService.traiter(id, req.user?.id, action, nouveau_statut, motif);

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      logger.info("✅ Courrier traité", {
        courrierId: id,
        reference: courrier.reference,
        action,
        nouveau_statut,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ success: true, message: `Action "${action}" effectuée avec succès`, data: courrier });
    } catch (err) {
      logger.error("❌ Erreur traitement:", { error: err.message, userId: req.user?.id });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== TRANSFERT INTERNE =====================
  static async transfererInterne(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    const { nouveauDestinataireId, motif } = req.body;

    try {
      if (!nouveauDestinataireId) {
        return res.status(400).json({ success: false, message: "Le nouveau destinataire est obligatoire" });
      }

      await CourrierService.transfererInterne(id, nouveauDestinataireId, req.user, motif);

      const courrier = await CourrierService.getById(id, req.user);
      await HistoriqueService.logUpdate(req, "courrier", null, courrier, "reference");

      logger.info("✅ Transfert interne effectué", {
        courrierId: id,
        reference: courrier.reference,
        nouveauDestinataireId,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ 
        success: true, 
        message: "Courrier réattribué avec succès à un autre agent de la même direction", 
        data: courrier 
      });
    } catch (err) {
      logger.error("❌ Erreur transfert interne:", { error: err.message, userId: req.user?.id });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // ===================== GET STATISTIQUES =====================
  static async getStatistiques(req, res) {
    const startTime = Date.now();
    try {
      logger.debug("📊 Récupération des statistiques", { userId: req.user?.id });
      
      const statistiques = await CourrierService.getStatistiques(req.user);
      
      logger.info("✅ Statistiques récupérées", {
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      
      return res.json({ success: true, data: statistiques });
    } catch (err) {
      logger.error("❌ Erreur getStatistiques:", { 
        error: err.message, 
        stack: err.stack,
        userId: req.user?.id 
      });
      return res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
  }

  // ===================== GET MES ATTRIBUÉS =====================
  static async getMesAttribues(req, res) {
    const startTime = Date.now();
    try {
      const courriers = await CourrierService.getMesAttribues(req.user?.id, req.user);

      logger.info("✅ Mes courriers attribués récupérés", {
        count: courriers.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ success: true, data: courriers, count: courriers.length });
    } catch (err) {
      logger.error("❌ Erreur getMesAttribues:", { error: err.message, userId: req.user?.id });
      return res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
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
      logger.error("❌ Erreur search courriers:", { error: err.message, userId: req.user?.id });
      return res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
  }

  // ===================== GET AUDIT =====================
  static async getAudit(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;

    try {
      const audit = await CourrierService.getAudit(id, req.user);
      
      logger.info("✅ Audit récupéré", {
        courrierId: id,
        count: audit.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      
      return res.json({ success: true, data: audit, count: audit.length });
    } catch (err) {
      logger.error("❌ Erreur getAudit:", { error: err.message, userId: req.user?.id });
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
      logger.error("❌ Erreur getCourriersEnRetard:", { error: err.message, userId: req.user?.id });
      return res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
  }

  // ===================== ADD PIECES JOINTES =====================
  static async addPiecesJointes(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    try {
      const files = req.files || [];
      if (files.length === 0) {
        return res.status(400).json({ success: false, message: "Aucun fichier fourni" });
      }

      await CourrierService.addPiecesJointes(id, files);

      logger.info("✅ Pièces jointes ajoutées", {
        courrierId: id,
        count: files.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      return res.json({ 
        success: true, 
        message: `${files.length} pièce(s) jointe(s) ajoutée(s)` 
      });
    } catch (err) {
      logger.error("❌ Erreur addPiecesJointes:", { error: err.message, userId: req.user?.id });
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ===================== GET PIECES JOINTES =====================
  static async getPiecesJointes(req, res) {
    const startTime = Date.now();
    const id = req.params.id || req.params.idcourrier;
    try {
      const pieces = await CourrierService.getPiecesJointes(id);
      
      logger.info("✅ Pièces jointes récupérées", {
        courrierId: id,
        count: pieces.length,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });
      
      return res.json({ success: true, data: pieces });
    } catch (err) {
      logger.error("❌ Erreur getPiecesJointes:", { error: err.message, userId: req.user?.id });
      return res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
    }
  }
}

module.exports = CourrierController;