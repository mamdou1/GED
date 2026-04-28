const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const DestinataireExterneService = require("../services/DestinataireExterneService");

class DestinataireExterneController {
  static async getAll(req, res) {
    try {
      const list = await DestinataireExterneService.getAll();
      logger.info(`Liste destinataires externes récupérée (${list.length})`);
      return res.json({ success: true, data: list });
    } catch (err) {
      logger.error("Erreur getAll destinataires externes:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const dest = await DestinataireExterneService.getById(req.params.id);
      return res.json({ success: true, data: dest });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const dest = await DestinataireExterneService.create(req.body);
      await HistoriqueService.logCreate(req, "destinataire_externe", dest, "nom");
      logger.info(`Destinataire externe créé: ${dest.nom}`);
      return res.status(201).json({ success: true, data: dest });
    } catch (err) {
      logger.error("Erreur création destinataire externe:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const dest = await DestinataireExterneService.update(req.params.id, req.body);
      await HistoriqueService.logUpdate(req, "destinataire_externe", null, dest, "nom");
      logger.info(`Destinataire externe mis à jour: ${dest.nom}`);
      return res.json({ success: true, data: dest });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await DestinataireExterneService.delete(req.params.id);
      await HistoriqueService.logDelete(req, "destinataire_externe", req.params.id);
      logger.info(`Destinataire externe supprimé: ${req.params.id}`);
      return res.json({ success: true, message: "Destinataire externe supprimé" });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = DestinataireExterneController;