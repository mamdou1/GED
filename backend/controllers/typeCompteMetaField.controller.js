// controllers/typeCompteMetaField.controller.js
const {
  TypeCompte,
  TypeCompteMetaField,
  TypeCompteMetaFieldValue,
} = require("../models");
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

    const typeCompte = await TypeCompte.findByPk(typeId);
    if (!typeCompte) {
      return res.status(404).json({
        success: false,
        message: "Type de compte introuvable",
      });
    }

    const field = await TypeCompteMetaField.create({
      ...req.body,
      type_compte_id: typeId,
    });

    logger.info("✅ Champ de métadonnées créé avec succès", {
      metaFieldId: field.id,
      typeId,
      label: field.label,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logCreate(req, "metaField", field);

    res.status(201).json({ success: true, data: field });
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

    const oldMetaField = await TypeCompteMetaField.findByPk(id);
    if (!oldMetaField) {
      logger.warn("⚠️ Champ de métadonnées non trouvé", {
        metaFieldId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Métadonnée non trouvée" });
    }

    const oldCopy = oldMetaField.toJSON();
    await oldMetaField.update(req.body);

    const updatedMetaField = await TypeCompteMetaField.findByPk(id);

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

    const metaField = await TypeCompteMetaField.findByPk(id);
    if (!metaField) {
      logger.warn("⚠️ Champ de métadonnées non trouvé pour suppression", {
        metaFieldId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Métadonnée non trouvée" });
    }

    await TypeCompteMetaFieldValue.destroy({ where: { meta_field_id: id } });
    await TypeCompteMetaField.destroy({ where: { id } });

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

    const typeCompte = await TypeCompte.findByPk(typeId, {
      include: [{ model: TypeCompteMetaField, as: "metaFields" }],
    });

    if (!typeCompte) {
      logger.warn("⚠️ Type de compte non trouvé", {
        typeId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Type de compte introuvable" });
    }

    logger.info("✅ Champs originaux récupérés", {
      typeId,
      count: typeCompte.metaFields?.length || 0,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({
      success: true,
      data: typeCompte.metaFields,
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
