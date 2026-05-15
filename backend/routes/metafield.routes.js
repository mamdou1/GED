const router = require("express").Router();
const ctrl = require("../controllers/metaField.controller");

// ==================== ROUTES SPÉCIFIQUES D'ABORD ====================

// Récupérer TOUS les champs (base + personnalisés)
router.get("/:typeId/entity/:entityType/:entityId/all", ctrl.getAllFieldsForEntity);

// Ajouter un champ personnalisé
router.post("/:typeId/entity/:entityType/:entityId/custom", ctrl.addCustomField);

// Modifier un champ personnalisé
router.put("/:typeId/entity/:entityType/:entityId/custom/:fieldId", ctrl.updateCustomField);

// Supprimer un champ personnalisé
router.delete("/:typeId/entity/:entityType/:entityId/custom/:fieldId", ctrl.deleteCustomField);

// Masquer/Afficher un champ personnalisé
router.put("/:typeId/entity/:entityType/:entityId/custom/:fieldId/toggle-hide", ctrl.toggleCustomFieldHide);

// Récupérer les champs AVEC surcharges pour une entité
router.get("/:typeId/entity/:entityType/:entityId", ctrl.getByTypeForEntity);

// Vérifier si une entité a des surcharges
router.get("/:typeId/entity/:entityType/:entityId/has-overrides", ctrl.hasOverrides);

// Supprimer toutes les surcharges d'une entité
router.delete("/:typeId/entity/:entityType/:entityId/overrides", ctrl.removeAllOverrides);

// Ajouter ou modifier une surcharge
router.post("/:typeId/meta-field/:metaFieldId/override", ctrl.setOverride);

// Supprimer une surcharge
router.delete("/:typeId/meta-field/:metaFieldId/override", ctrl.removeOverride);

// Cloner les surcharges d'une entité vers une autre
router.post("/overrides/clone", ctrl.cloneOverrides);

// ==================== ROUTES GÉNÉRIQUES EN DERNIER ====================

// Récupérer les champs originaux (sans surcharge)
router.get("/:typeId", ctrl.getByType);

// Créer un champ de base
router.post("/:typeId", ctrl.create);

// Modifier un champ de base
router.put("/:id", ctrl.update);

// Supprimer un champ de base
router.delete("/:id", ctrl.remove);
router.get(
  "/:typeId/entity/:entityType/:entityId/all",
  ctrl.getAllFieldsForEntity,
);

module.exports = router;