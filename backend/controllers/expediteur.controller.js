const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const ExpediteurService = require("../services/ExpediteurService");

class ExpediteurController {
  static async getAll(req, res) {
    try {
      const expediteurs = await ExpediteurService.getAll();
      logger.info(`Liste des expéditeurs récupérée (${expediteurs.length})`);
      return res.json({ success: true, data: expediteurs });
    } catch (err) {
      logger.error("Erreur getAll expediteurs:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const expediteur = await ExpediteurService.getById(req.params.id);
      return res.json({ success: true, data: expediteur });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const expediteur = await ExpediteurService.create(req.body);
      await HistoriqueService.logCreate(req, "expediteur", expediteur, "nom");
      logger.info(`Expéditeur créé: ${expediteur.nom}`);
      return res.status(201).json({ success: true, data: expediteur });
    } catch (err) {
      logger.error("Erreur création expediteur:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const expediteur = await ExpediteurService.update(req.params.id, req.body);
      await HistoriqueService.logUpdate(req, "expediteur", null, expediteur, "nom");
      logger.info(`Expéditeur mis à jour: ${expediteur.nom}`);
      return res.json({ success: true, data: expediteur });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await ExpediteurService.delete(req.params.id);
      await HistoriqueService.logDelete(req, "expediteur", req.params.id);
      logger.info(`Expéditeur supprimé: ${req.params.id}`);
      return res.json({ success: true, message: "Expéditeur supprimé" });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = ExpediteurController;