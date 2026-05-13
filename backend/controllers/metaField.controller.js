// controllers/metaField.controller.js
const { TypeDocument, MetaField } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

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

    // Journalisation dans l'historique
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

    // Journalisation dans l'historique
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

    await MetaField.destroy({ where: { id } });

    logger.info("✅ Champ de métadonnées supprimé avec succès", {
      metaFieldId: id,
      label: metaField.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
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
    logger.debug("🔍 Récupération des champs de métadonnées d'un type", {
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

    logger.info("✅ Champs de métadonnées récupérés", {
      typeId,
      count: typeDocument.metaFields?.length || 0,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(typeDocument.metaFields);
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

exports.getAllFieldsForEntity = async (req, res) => {
  const startTime = Date.now();
  const { typeId, entityType, entityId } = req.params;

  try {
    console.log(
      `🔍 getAllFieldsForEntity: typeId=${typeId}, entityType=${entityType}, entityId=${entityId}`,
    );

    const baseFields = await MetaField.findAll({
      where: { type_document_id: parseInt(typeId) },
      order: [["position", "ASC"]],
    });

    console.log(`📋 Champs de base trouvés: ${baseFields.length}`);

    const overrides = await MetaFieldOverride.findAll({
      where: {
        type_document_id: parseInt(typeId),
        entity_type: entityType,
        entity_id: parseInt(entityId),
      },
    });

    const overrideMap = new Map();
    overrides.forEach((o) => overrideMap.set(o.meta_field_id, o));

    const formattedBaseFields = baseFields.map((field) => {
      const override = overrideMap.get(field.id);
      return {
        id: field.id,
        name: field.name,
        label: override?.label_override || field.label,
        field_type: field.field_type || "TEXT",
        required:
          override?.required_override !== undefined
            ? override.required_override
            : field.required === 1 || field.required === true,
        position:
          override?.position_override !== undefined
            ? override.position_override
            : field.position || 0,
        options: override?.options_override || field.options,
        placeholder: override?.placeholder_override || field.placeholder,
        description: override?.description_override || field.description,
        default_value: override?.default_value_override || field.default_value,
        source: "base",
        is_overridden: !!override,
        hidden: override?.hidden === true,
        original: override
          ? {
              label: field.label,
              required: field.required === 1 || field.required === true,
              position: field.position || 0,
            }
          : null,
      };
    });

    console.log(`📋 Champs de base formatés: ${formattedBaseFields.length}`);

    const customFields = await EntityCustomField.findAll({
      where: {
        type_document_id: parseInt(typeId),
        entity_type: entityType,
        entity_id: parseInt(entityId),
        is_active: true,
      },
      order: [["position", "ASC"]],
    });

    console.log(`📋 Champs personnalisés trouvés: ${customFields.length}`);

    const formattedCustomFields = customFields.map((field) => ({
      id: field.id,
      name: field.name,
      label: field.label,
      field_type: field.field_type,
      required: field.required === 1 || field.required === true,
      position: field.position || 0,
      options: field.options,
      placeholder: field.placeholder,
      description: field.description,
      default_value: field.default_value,
      source: "custom",
      is_custom: true,
      is_overridden: false,
      hidden: field.hidden === true,
    }));

    const allFields = [...formattedBaseFields, ...formattedCustomFields].sort(
      (a, b) => a.position - b.position,
    );

    console.log(
      `📋 TOTAL: base=${formattedBaseFields.length}, custom=${formattedCustomFields.length}, total=${allFields.length}`,
    );

    res.json({
      success: true,
      data: allFields,
      summary: {
        base: formattedBaseFields.length,
        custom: formattedCustomFields.length,
        total: allFields.length,
      },
    });
  } catch (e) {
    console.error("❌ Erreur getAllFieldsForEntity:", e);
    res.status(500).json({ message: e.message });
  }
};
