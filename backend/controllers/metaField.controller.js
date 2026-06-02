// controllers/metaField.controller.js
const {
  TypeDocument,
  MetaField,
  MetaFieldOverride,
  EntityCustomField,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
} = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const metaFieldOverrideService = require("../services/metaFieldOverrideService");

exports.create = async (req, res) => {
  const startTime = Date.now();
  const { typeId } = req.params;

  try {
    logger.info("📝 Tentative de création d'un champ de métadonnées", {
      typeId,
      userId: req.user?.id,
      body: req.body,
    });

    const field = await MetaField.create({
      ...req.body,
      type_document_id: typeId,
    });

    logger.info("✅ Champ de métadonnées créé avec succès", {
      metaFieldId: field.id,
      typeId,
      label: field.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logCreate(req, "metaField", field);

    res.json(field);
  } catch (e) {
    logger.error("❌ Erreur création metaField:", {
      typeId,
      error: e.message,
      stack: e.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'un champ de métadonnées", {
      metaFieldId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldMetaField = await MetaField.findByPk(id);
    if (!oldMetaField) {
      logger.warn("⚠️ Champ de métadonnées non trouvé", {
        metaFieldId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Métadonnée non trouvée" });
    }

    const oldCopy = oldMetaField.toJSON();
    await oldMetaField.update(req.body);

    const updatedMetaField = await MetaField.findByPk(id);

    logger.info("✅ Champ de métadonnées mis à jour avec succès", {
      metaFieldId: id,
      label: updatedMetaField.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logUpdate(
      req,
      "metaField",
      oldCopy,
      updatedMetaField,
    );

    res.json({ success: true });
  } catch (e) {
    logger.error("❌ Erreur update metaField:", {
      metaFieldId: id,
      error: e.message,
      stack: e.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un champ de métadonnées", {
      metaFieldId: id,
      userId: req.user?.id,
    });

    const metaField = await MetaField.findByPk(id);
    if (!metaField) {
      logger.warn("⚠️ Champ de métadonnées non trouvé pour suppression", {
        metaFieldId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Métadonnée non trouvée" });
    }

    await MetaFieldOverride.destroy({ where: { meta_field_id: id } });
    await MetaField.destroy({ where: { id } });

    logger.info("✅ Champ de métadonnées supprimé avec succès", {
      metaFieldId: id,
      label: metaField.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logDelete(req, "metaField", metaField);

    res.json({ success: true });
  } catch (e) {
    logger.error("❌ Erreur remove metaField:", {
      metaFieldId: id,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.getByType = async (req, res) => {
  const startTime = Date.now();
  const { typeId } = req.params;

  try {
    logger.debug("🔍 Récupération des champs originaux d'un type", {
      typeId,
      userId: req.user?.id,
    });

    const typeDocument = await TypeDocument.findByPk(typeId, {
      include: [{ model: MetaField, as: "metaFields" }],
    });

    if (!typeDocument) {
      logger.warn("⚠️ Type de document non trouvé", {
        typeId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Type de document introuvable" });
    }

    logger.info("✅ Champs originaux récupérés", {
      typeId,
      count: typeDocument.metaFields?.length || 0,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({
      success: true,
      data: typeDocument.metaFields,
      isOriginal: true,
    });
  } catch (e) {
    logger.error("❌ Erreur getByType metaFields:", {
      typeId,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

// exports.getAllFieldsForEntity = async (req, res) => {
//   const startTime = Date.now();
//   const { typeId, entityType, entityId } = req.params;

//   try {
//     console.log(
//       `🔍 getAllFieldsForEntity: typeId=${typeId}, entityType=${entityType}, entityId=${entityId}`,
//     );

//     const baseFields = await MetaField.findAll({
//       where: { type_document_id: parseInt(typeId) },
//       order: [["position", "ASC"]],
//     });

//     console.log(`📋 Champs de base trouvés: ${baseFields.length}`);

//     const overrides = await MetaFieldOverride.findAll({
//       where: {
//         type_document_id: parseInt(typeId),
//         entity_type: entityType,
//         entity_id: parseInt(entityId),
//       },
//     });

//     const overrideMap = new Map();
//     overrides.forEach((o) => overrideMap.set(o.meta_field_id, o));

//     const formattedBaseFields = baseFields.map((field) => {
//       const override = overrideMap.get(field.id);
//       return {
//         id: field.id,
//         name: field.name,
//         label: override?.label_override || field.label,
//         field_type: field.field_type || "TEXT",
//         required:
//           override?.required_override !== undefined
//             ? override.required_override
//             : field.required === 1 || field.required === true,
//         position:
//           override?.position_override !== undefined
//             ? override.position_override
//             : field.position || 0,
//         options: override?.options_override || field.options,
//         placeholder: override?.placeholder_override || field.placeholder,
//         description: override?.description_override || field.description,
//         default_value: override?.default_value_override || field.default_value,
//         source: "base",
//         is_overridden: !!override,
//         hidden: override?.hidden === true,
//         original: override
//           ? {
//               label: field.label,
//               required: field.required === 1 || field.required === true,
//               position: field.position || 0,
//             }
//           : null,
//       };
//     });

//     console.log(`📋 Champs de base formatés: ${formattedBaseFields.length}`);

//     const customFields = await EntityCustomField.findAll({
//       where: {
//         type_document_id: parseInt(typeId),
//         entity_type: entityType,
//         entity_id: parseInt(entityId),
//         is_active: true,
//       },
//       order: [["position", "ASC"]],
//     });

//     console.log(`📋 Champs personnalisés trouvés: ${customFields.length}`);

//     const formattedCustomFields = customFields.map((field) => ({
//       id: field.id,
//       name: field.name,
//       label: field.label,
//       field_type: field.field_type,
//       required: field.required === 1 || field.required === true,
//       position: field.position || 0,
//       options: field.options,
//       placeholder: field.placeholder,
//       description: field.description,
//       default_value: field.default_value,
//       source: "custom",
//       is_custom: true,
//       is_overridden: false,
//       hidden: field.hidden === true,
//     }));

//     const allFields = [...formattedBaseFields, ...formattedCustomFields].sort(
//       (a, b) => a.position - b.position,
//     );

//     console.log(
//       `📋 TOTAL: base=${formattedBaseFields.length}, custom=${formattedCustomFields.length}, total=${allFields.length}`,
//     );

//     res.json({
//       success: true,
//       data: allFields,
//       summary: {
//         base: formattedBaseFields.length,
//         custom: formattedCustomFields.length,
//         total: allFields.length,
//       },
//     });
//   } catch (e) {
//     console.error("❌ Erreur getAllFieldsForEntity:", e);
//     res.status(500).json({ message: e.message });
//   }
// };

// ==================== SURCHARGES POUR CHAMPS DE BASE ====================

exports.getByTypeForEntity = async (req, res) => {
  const startTime = Date.now();
  const { typeId, entityType, entityId } = req.params;

  try {
    logger.debug("🔍 Récupération des champs avec surcharges pour une entité", {
      typeId,
      entityType,
      entityId,
      userId: req.user?.id,
    });

    const typeDocument = await TypeDocument.findByPk(typeId);
    if (!typeDocument) {
      logger.warn("⚠️ Type de document non trouvé", {
        typeId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Type de document introuvable" });
    }

    const entityValid = await validateEntity(entityType, parseInt(entityId));
    if (!entityValid) {
      logger.warn("⚠️ Entité non trouvée", {
        entityType,
        entityId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Entité introuvable" });
    }

    const fields = await metaFieldOverrideService.getMetaFieldsWithOverrides(
      parseInt(typeId),
      entityType,
      parseInt(entityId),
    );

    logger.info("✅ Champs avec surcharges récupérés", {
      typeId,
      entityType,
      entityId,
      count: fields.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({
      success: true,
      data: fields,
      entity: {
        type: entityType,
        id: parseInt(entityId),
      },
    });
  } catch (e) {
    logger.error("❌ Erreur getByTypeForEntity:", {
      typeId,
      entityType,
      entityId,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.setOverride = async (req, res) => {
  const startTime = Date.now();
  const { typeId, metaFieldId } = req.params;
  const { entityType, entityId, ...overrideData } = req.body;

  try {
    logger.info("📝 Création/mise à jour d'une surcharge", {
      typeId,
      metaFieldId,
      entityType,
      entityId,
      userId: req.user?.id,
      overrideData,
    });

    const metaField = await MetaField.findByPk(metaFieldId);
    if (!metaField) {
      logger.warn("⚠️ Champ de métadonnées non trouvé", {
        metaFieldId,
        userId: req.user?.id,
      });
      return res
        .status(404)
        .json({ message: "Champ de métadonnées introuvable" });
    }

    const entityValid = await validateEntity(entityType, parseInt(entityId));
    if (!entityValid) {
      logger.warn("⚠️ Entité non trouvée", {
        entityType,
        entityId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Entité introuvable" });
    }

    const override = await metaFieldOverrideService.setOverride(
      parseInt(typeId),
      parseInt(metaFieldId),
      entityType,
      parseInt(entityId),
      overrideData,
    );

    logger.info("✅ Surcharge enregistrée avec succès", {
      typeId,
      metaFieldId,
      entityType,
      entityId,
      overrideId: override.id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logCreate(req, "metaFieldOverride", override);

    res.json({
      success: true,
      data: override,
      message: "Surcharge enregistrée avec succès",
    });
  } catch (e) {
    logger.error("❌ Erreur setOverride:", {
      typeId,
      metaFieldId,
      entityType,
      entityId,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.removeOverride = async (req, res) => {
  const startTime = Date.now();
  const { typeId, metaFieldId } = req.params;
  const { entityType, entityId } = req.body;

  try {
    logger.info("🗑️ Suppression d'une surcharge", {
      typeId,
      metaFieldId,
      entityType,
      entityId,
      userId: req.user?.id,
    });

    const deleted = await metaFieldOverrideService.removeOverride(
      parseInt(typeId),
      parseInt(metaFieldId),
      entityType,
      parseInt(entityId),
    );

    if (deleted === 0) {
      logger.warn("⚠️ Aucune surcharge trouvée à supprimer", {
        typeId,
        metaFieldId,
        entityType,
        entityId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Aucune surcharge trouvée" });
    }

    logger.info("✅ Surcharge supprimée avec succès", {
      typeId,
      metaFieldId,
      entityType,
      entityId,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({
      success: true,
      message: "Surcharge supprimée avec succès",
    });
  } catch (e) {
    logger.error("❌ Erreur removeOverride:", {
      typeId,
      metaFieldId,
      entityType,
      entityId,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.removeAllOverrides = async (req, res) => {
  const startTime = Date.now();
  const { typeId, entityType, entityId } = req.params;

  try {
    logger.info("🗑️ Suppression de toutes les surcharges d'une entité", {
      typeId,
      entityType,
      entityId,
      userId: req.user?.id,
    });

    const deleted = await metaFieldOverrideService.removeAllOverrides(
      parseInt(typeId),
      entityType,
      parseInt(entityId),
    );

    logger.info("✅ Toutes les surcharges supprimées", {
      typeId,
      entityType,
      entityId,
      count: deleted,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({
      success: true,
      message: `${deleted} surcharge(s) supprimée(s) avec succès`,
    });
  } catch (e) {
    logger.error("❌ Erreur removeAllOverrides:", {
      typeId,
      entityType,
      entityId,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.hasOverrides = async (req, res) => {
  const startTime = Date.now();
  const { typeId, entityType, entityId } = req.params;

  try {
    const hasOverrides = await metaFieldOverrideService.hasOverrides(
      parseInt(typeId),
      entityType,
      parseInt(entityId),
    );

    res.json({
      success: true,
      data: { hasOverrides },
    });
  } catch (e) {
    logger.error("❌ Erreur hasOverrides:", {
      typeId,
      entityType,
      entityId,
      error: e.message,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.cloneOverrides = async (req, res) => {
  const startTime = Date.now();
  const { sourceType, sourceId, targetType, targetId, typeDocumentId } =
    req.body;

  try {
    logger.info("📋 Clonage des surcharges", {
      sourceType,
      sourceId,
      targetType,
      targetId,
      typeDocumentId,
      userId: req.user?.id,
    });

    const clones = await metaFieldOverrideService.cloneOverrides(
      sourceType,
      parseInt(sourceId),
      targetType,
      parseInt(targetId),
      typeDocumentId ? parseInt(typeDocumentId) : null,
    );

    logger.info("✅ Surcharges clonées avec succès", {
      sourceType,
      sourceId,
      targetType,
      targetId,
      count: clones.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({
      success: true,
      message: `${clones.length} surcharge(s) clonée(s) avec succès`,
      data: clones,
    });
  } catch (e) {
    logger.error("❌ Erreur cloneOverrides:", {
      sourceType,
      sourceId,
      targetType,
      targetId,
      typeDocumentId,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

// ==================== GESTION DES CHAMPS PERSONNALISÉS ====================

// ✅ VERSION CORRIGÉE - Retourne TOUS les champs personnalisés
exports.getAllFieldsForEntity = async (req, res) => {
  const { typeId, entityType, entityId } = req.params;

  try {
    console.log(
      `🔍 getAllFieldsForEntity: typeId=${typeId}, entityType=${entityType}, entityId=${entityId}`,
    );

    // 1. Champs de base
    const baseFields = await MetaField.findAll({
      where: { type_document_id: parseInt(typeId) },
      order: [["position", "ASC"]],
    });

    // ✅ CORRECTION: Sequelize retourne déjà un boolean, donc il faut juste garder la valeur
    let formattedBaseFields = baseFields.map((f) => ({
      id: f.id,
      name: f.name,
      label: f.label,
      field_type: f.field_type,
      required: f.required === true || f.required === 1, // ✅ Accepte les deux formats
      position: f.position || 0,
      options: f.options,
      placeholder: f.placeholder,
      description: f.description,
      source: "base",
      hidden: false,
    }));

    if (
      entityType &&
      entityId &&
      entityType !== "null" &&
      entityId !== "null"
    ) {
      const overrides = await MetaFieldOverride.findAll({
        where: {
          type_document_id: parseInt(typeId),
          entity_type: entityType,
          entity_id: parseInt(entityId),
        },
      });
      const overrideMap = new Map(overrides.map((o) => [o.meta_field_id, o]));
      formattedBaseFields = baseFields.map((field) => {
        const override = overrideMap.get(field.id);
        return {
          id: field.id,
          name: field.name,
          label: override?.label_override || field.label,
          field_type: field.field_type,
          required:
            override?.required_override !== undefined
              ? override.required_override === true ||
                override.required_override === 1 // ✅ Accepte les deux formats
              : field.required === true || field.required === 1, // ✅ Accepte les deux formats
          position: override?.position_override ?? field.position ?? 0,
          options: override?.options_override || field.options,
          placeholder: override?.placeholder_override || field.placeholder,
          description: override?.description_override || field.description,
          source: "base",
          hidden: override?.hidden === true,
        };
      });
    }

    // 3. Champs personnalisés
    let customFields = [];

    if (
      entityType &&
      entityId &&
      entityType !== "null" &&
      entityId !== "null"
    ) {
      customFields = await EntityCustomField.findAll({
        where: {
          type_document_id: parseInt(typeId),
          entity_type: entityType,
          entity_id: parseInt(entityId),
          is_active: true,
        },
        order: [["position", "ASC"]],
      });
      console.log(
        `📋 Champs personnalisés pour ${entityType}/${entityId}: ${customFields.length}`,
      );
    }

    // ✅ CORRECTION pour les champs personnalisés aussi
    const formattedCustomFields = customFields.map((field) => ({
      id: field.id,
      name: field.name,
      label: field.label,
      field_type: field.field_type,
      required: field.required === true || field.required === 1, // ✅ Accepte les deux formats
      position: field.position || 0,
      options: field.options,
      placeholder: field.placeholder,
      description: field.description,
      source: "custom",
      hidden: field.hidden === true,
    }));

    const allFields = [...formattedBaseFields, ...formattedCustomFields].sort(
      (a, b) => a.position - b.position,
    );

    console.log(
      `📋 RÉSULTAT DETAIL:`,
      allFields.map((f) => ({
        label: f.label,
        required: f.required,
        type: typeof f.required,
      })),
    );

    res.json({ success: true, data: allFields });
  } catch (e) {
    console.error("❌ Erreur getAllFieldsForEntity:", e);
    res.status(500).json({ message: e.message });
  }
};

exports.addCustomField = async (req, res) => {
  const startTime = Date.now();
  const { typeId, entityType, entityId } = req.params;

  try {
    logger.info("📝 Ajout d'un champ personnalisé", {
      typeId,
      entityType,
      entityId,
      userId: req.user?.id,
      body: req.body,
    });

    // Vérifier si l'entité existe (si fournie)
    if (
      entityType &&
      entityId &&
      entityType !== "null" &&
      entityId !== "null"
    ) {
      const entityValid = await validateEntity(entityType, parseInt(entityId));
      if (!entityValid) {
        return res.status(404).json({ message: "Entité introuvable" });
      }
    }

    const existingField = await EntityCustomField.findOne({
      where: {
        type_document_id: parseInt(typeId),
        entity_type: entityType || null,
        entity_id: entityId ? parseInt(entityId) : null,
        name: req.body.name,
      },
    });

    if (existingField) {
      return res.status(400).json({
        message: `Un champ avec le nom "${req.body.name}" existe déjà`,
      });
    }

    const customField = await EntityCustomField.create({
      type_document_id: parseInt(typeId),
      entity_type: entityType || null,
      entity_id: entityId ? parseInt(entityId) : null,
      ...req.body,
    });

    logger.info("✅ Champ personnalisé ajouté avec succès", {
      customFieldId: customField.id,
      name: customField.name,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logCreate(req, "entityCustomField", customField);

    res.json({
      success: true,
      data: customField,
      message: "Champ personnalisé ajouté avec succès",
    });
  } catch (e) {
    logger.error("❌ Erreur addCustomField:", {
      typeId,
      entityType,
      entityId,
      error: e.message,
      stack: e.stack,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.updateCustomField = async (req, res) => {
  const startTime = Date.now();
  const { typeId, entityType, entityId, fieldId } = req.params;

  try {
    logger.info("📝 Modification d'un champ personnalisé", {
      fieldId,
      typeId,
      entityType,
      entityId,
      userId: req.user?.id,
    });

    const customField = await EntityCustomField.findOne({
      where: {
        id: parseInt(fieldId),
        type_document_id: parseInt(typeId),
      },
    });

    if (!customField) {
      return res.status(404).json({ message: "Champ personnalisé non trouvé" });
    }

    const oldCopy = customField.toJSON();
    await customField.update(req.body);

    logger.info("✅ Champ personnalisé modifié avec succès", {
      fieldId,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logUpdate(
      req,
      "entityCustomField",
      oldCopy,
      customField,
    );

    res.json({
      success: true,
      data: customField,
      message: "Champ personnalisé modifié avec succès",
    });
  } catch (e) {
    logger.error("❌ Erreur updateCustomField:", {
      fieldId,
      error: e.message,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.deleteCustomField = async (req, res) => {
  const startTime = Date.now();
  const { typeId, entityType, entityId, fieldId } = req.params;

  try {
    logger.info("🗑️ Suppression d'un champ personnalisé", {
      fieldId,
      typeId,
      entityType,
      entityId,
      userId: req.user?.id,
    });

    const customField = await EntityCustomField.findOne({
      where: {
        id: parseInt(fieldId),
        type_document_id: parseInt(typeId),
      },
    });

    if (!customField) {
      return res.status(404).json({ message: "Champ personnalisé non trouvé" });
    }

    await customField.destroy();

    logger.info("✅ Champ personnalisé supprimé avec succès", {
      fieldId,
      name: customField.name,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logDelete(req, "entityCustomField", customField);

    res.json({
      success: true,
      message: "Champ personnalisé supprimé avec succès",
    });
  } catch (e) {
    logger.error("❌ Erreur deleteCustomField:", {
      fieldId,
      error: e.message,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.toggleCustomFieldHide = async (req, res) => {
  const startTime = Date.now();
  const { typeId, entityType, entityId, fieldId } = req.params;
  const { hidden } = req.body;

  try {
    logger.info("👁️ Masquage/Affichage d'un champ personnalisé", {
      fieldId,
      typeId,
      entityType,
      entityId,
      hidden,
      userId: req.user?.id,
    });

    const customField = await EntityCustomField.findOne({
      where: {
        id: parseInt(fieldId),
        type_document_id: parseInt(typeId),
      },
    });

    if (!customField) {
      logger.warn("⚠️ Champ personnalisé non trouvé", { fieldId });
      return res.status(404).json({ message: "Champ personnalisé non trouvé" });
    }

    await customField.update({ hidden: hidden === true });

    logger.info("✅ Champ personnalisé mis à jour", {
      fieldId,
      name: customField.name,
      hidden,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logUpdate(
      req,
      "entityCustomField",
      { hidden: !hidden },
      { hidden: hidden },
    );

    res.json({
      success: true,
      data: customField,
      message: hidden
        ? "Champ masqué avec succès"
        : "Champ affiché avec succès",
    });
  } catch (e) {
    logger.error("❌ Erreur toggleCustomFieldHide:", {
      fieldId,
      error: e.message,
    });
    res.status(500).json({ message: e.message });
  }
};

async function validateEntity(entityType, entityId) {
  const models = {
    EntiteeUn: EntiteeUn,
    EntiteeDeux: EntiteeDeux,
    EntiteeTrois: EntiteeTrois,
  };

  const Model = models[entityType];
  if (!Model) return false;

  const entity = await Model.findByPk(entityId);
  return !!entity;
}
