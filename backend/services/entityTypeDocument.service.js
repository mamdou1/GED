const sequelize = require("../config/database");
const HistoriqueService = require("./historique.service");

/**
 * Service générique pour ajouter des types de documents à une entité
 * @param {Model} EntityModel - Le modèle Sequelize de l'entité (Direction, Service, etc.)
 * @param {string} entityName - Nom de l'entité pour les logs (ex: "Direction")
 * @param {string} associationMethod - Méthode d'association (ex: "addTypeDocuments")
 */
exports.addTypesToEntity = (
  EntityModel,
  entityName,
  associationMethod = "addTypeDocuments",
) => {
  return async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { typeIds } = req.body;

      if (!typeIds || !Array.isArray(typeIds) || typeIds.length === 0) {
        return res.status(400).json({
          message: "typeIds est requis et doit être un tableau non vide",
        });
      }

      const entity = await EntityModel.findByPk(id);
      if (!entity) {
        return res.status(404).json({ message: `${entityName} introuvable` });
      }

      await entity[associationMethod](typeIds, { transaction: t });

      await t.commit();

      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "update",
        resource: `${entityName.toLowerCase()}_types`,
        resource_id: id,
        description: `Ajout de ${typeIds.length} type(s) de document à ${entityName.toLowerCase()} ${id}`,
        method: req.method,
        path: req.originalUrl,
        status: 200,
      });

      res.json({
        message: `${typeIds.length} type(s) de document ajouté(s) avec succès`,
      });
    } catch (err) {
      await t.rollback();
      console.error(`Erreur addTypesTo${entityName}:`, err);
      res.status(500).json({ message: err.message });
    }
  };
};

/**
 * Service générique pour retirer des types de documents d'une entité
 */
exports.removeTypesFromEntity = (
  EntityModel,
  entityName,
  associationMethod = "removeTypeDocuments",
) => {
  return async (req, res) => {
    try {
      const { id } = req.params;
      const { typeIds } = req.body;

      if (!typeIds || !Array.isArray(typeIds) || typeIds.length === 0) {
        return res.status(400).json({
          message: "typeIds est requis et doit être un tableau non vide",
        });
      }

      const entity = await EntityModel.findByPk(id);
      if (!entity) {
        return res.status(404).json({ message: `${entityName} introuvable` });
      }

      await entity[associationMethod](typeIds);

      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "update",
        resource: `${entityName.toLowerCase()}_types`,
        resource_id: id,
        description: `Retrait de ${typeIds.length} type(s) de document de ${entityName.toLowerCase()} ${id}`,
        method: req.method,
        path: req.originalUrl,
        status: 200,
      });

      res.json({
        message: `${typeIds.length} type(s) de document retiré(s) avec succès`,
      });
    } catch (err) {
      console.error(`Erreur removeTypesFrom${entityName}:`, err);
      res.status(500).json({ message: err.message });
    }
  };
};

/**
 * Service générique pour obtenir les types de documents d'une entité
 */
exports.getTypesOfEntity = (EntityModel, entityName, includeModels = []) => {
  return async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const entity = await EntityModel.findByPk(id, {
        include: includeModels,
      });

      if (!entity) {
        return res.status(404).json({ message: `${entityName} introuvable` });
      }

      // Récupérer les types de documents via l'association
      const types = await entity.getTypeDocuments();

      res.json(types || []);
    } catch (err) {
      console.error(`Erreur getTypesOf${entityName}:`, err);
      res.status(500).json({ message: err.message });
    }
  };
};
