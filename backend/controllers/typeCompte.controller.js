// backend/controllers/typeCompte.controller.js
const { TypeCompte, Compte, TypeCompteMetaField } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const { Op } = require("sequelize");

/**
 * ✅ Récupérer tous les types de compte
 */
exports.getAll = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de tous les types de compte", {
      userId: req.user?.id,
      query: req.query,
    });

    const { search, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (search) {
      where.nom = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await TypeCompte.findAndCountAll({
      where,
      include: [
        {
          model: Compte,
          as: "comptes",
          attributes: ["id", "type_compte_id", "client_id", "agent_id"],
          required: false,
        },
        {
          model: TypeCompteMetaField,
          as: "metaFields",
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    logger.info("✅ Types de compte récupérés", {
      count: rows.length,
      total: count,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "typeCompte",
        resource_id: null,
        resource_identifier: "liste des types de compte",
        description: "Consultation de la liste des types de compte",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: rows.length,
          total: count,
          duration: Date.now() - startTime,
        },
      });
    }

    res.json({
      success: true,
      data: rows,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    logger.error("❌ Erreur récupération types de compte:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des types de compte",
      error: err.message,
    });
  }
};

/**
 * ✅ Récupérer un type de compte par ID
 */
exports.getById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Recherche d'un type de compte par ID", {
      typeId: id,
      userId: req.user?.id,
    });

    const typeCompte = await TypeCompte.findByPk(id, {
      include: [
        {
          model: Compte,
          as: "comptes",
          attributes: ["id", "type_compte_id", "client_id", "agent_id"],
          required: false,
        },
        {
          model: TypeCompteMetaField,
          as: "metaFields",
          required: false,
        },
      ],
    });

    if (!typeCompte) {
      logger.warn("⚠️ Type de compte non trouvé", {
        typeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Type de compte non trouvé",
      });
    }

    logger.info("✅ Type de compte trouvé", {
      typeId: id,
      nom: typeCompte.nom,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "typeCompte",
      resource_id: typeCompte.id,
      resource_identifier: typeCompte.nom,
      description: `Consultation du type de compte #${typeCompte.id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
      },
    });

    res.json({
      success: true,
      data: typeCompte,
    });
  } catch (err) {
    logger.error("❌ Erreur recherche type de compte:", {
      typeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche du type de compte",
      error: err.message,
    });
  }
};

/**
 * ✅ Créer un type de compte
 */
exports.create = async (req, res) => {
  const startTime = Date.now();

  try {
    const { nom } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le nom du type de compte est obligatoire",
      });
    }

    logger.info("📝 Tentative de création d'un type de compte", {
      userId: req.user?.id,
      body: { ...req.body },
    });

    // Vérifier l'unicité du nom
    const existing = await TypeCompte.findOne({
      where: { nom: { [Op.eq]: nom } },
    });

    if (existing) {
      logger.warn("⚠️ Type de compte déjà existant", {
        nom,
        userId: req.user?.id,
      });
      return res.status(400).json({
        success: false,
        message: "Un type de compte avec ce nom existe déjà",
      });
    }

    const typeCompte = await TypeCompte.create({
      nom: nom.trim(),
    });

    logger.info("✅ Type de compte créé avec succès", {
      typeId: typeCompte.id,
      nom: typeCompte.nom,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logCreate(req, "typeCompte", typeCompte);

    res.status(201).json({
      success: true,
      message: "Type de compte créé avec succès",
      data: typeCompte,
    });
  } catch (err) {
    logger.error("❌ Erreur création type de compte:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du type de compte",
      error: err.message,
    });
  }
};

/**
 * ✅ Mettre à jour un type de compte
 */
exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'un type de compte", {
      typeId: id,
      userId: req.user?.id,
      body: { ...req.body },
    });

    const oldTypeCompte = await TypeCompte.findByPk(id);
    if (!oldTypeCompte) {
      logger.warn("⚠️ Type de compte non trouvé pour mise à jour", {
        typeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Type de compte non trouvé",
      });
    }

    const oldCopy = oldTypeCompte.toJSON();
    const { nom } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le nom du type de compte est obligatoire",
      });
    }

    // Vérifier l'unicité du nom (exclure l'élément actuel)
    const existing = await TypeCompte.findOne({
      where: {
        id: { [Op.ne]: id },
        nom: { [Op.eq]: nom },
      },
    });

    if (existing) {
      logger.warn("⚠️ Conflit mise à jour - nom déjà utilisé", {
        typeId: id,
        nom,
        userId: req.user?.id,
      });
      return res.status(400).json({
        success: false,
        message: "Un autre type de compte avec ce nom existe déjà",
      });
    }

    await oldTypeCompte.update({
      nom: nom.trim(),
    });

    const updatedTypeCompte = await TypeCompte.findByPk(id);

    logger.info("✅ Type de compte mis à jour avec succès", {
      typeId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logUpdate(
      req,
      "typeCompte",
      oldCopy,
      updatedTypeCompte,
    );

    res.json({
      success: true,
      message: "Type de compte mis à jour avec succès",
      data: updatedTypeCompte,
    });
  } catch (err) {
    logger.error("❌ Erreur mise à jour type de compte:", {
      typeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du type de compte",
      error: err.message,
    });
  }
};

/**
 * ✅ Supprimer un type de compte
 */
exports.remove = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un type de compte", {
      typeId: id,
      userId: req.user?.id,
    });

    const typeCompte = await TypeCompte.findByPk(id);
    if (!typeCompte) {
      logger.warn("⚠️ Type de compte non trouvé pour suppression", {
        typeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Type de compte non trouvé",
      });
    }

    // Vérifier si le type de compte a des comptes associés
    const comptesCount = await Compte.count({
      where: { type_compte_id: id },
    });

    if (comptesCount > 0) {
      logger.warn(
        "⚠️ Suppression impossible - type de compte lié à des comptes",
        {
          typeId: id,
          comptesCount,
          userId: req.user?.id,
        },
      );
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer ce type de compte car il est lié à ${comptesCount} compte(s)`,
      });
    }

    await typeCompte.destroy();

    logger.info("✅ Type de compte supprimé avec succès", {
      typeId: id,
      nom: typeCompte.nom,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logDelete(req, "typeCompte", typeCompte);

    res.json({
      success: true,
      message: "Type de compte supprimé avec succès",
    });
  } catch (err) {
    logger.error("❌ Erreur suppression type de compte:", {
      typeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du type de compte",
      error: err.message,
    });
  }
};
