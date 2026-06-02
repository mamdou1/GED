// controllers/compte.controller.js
const {
  Compte,
  TypeCompte,
  Client,
  TypeCompteMetaField,
  TypeCompteMetaFieldValue,
  TypeDocument,
  Agent,
  sequelize,
} = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

const compteInclude = [
  {
    model: TypeCompte,
    as: "type_compte",
    include: [{ model: TypeCompteMetaField, as: "metaFields" }],
  },
  {
    model: Client,
    as: "client",
    attributes: [
      "id",
      "nom",
      "prenom",
      "raison_sociale",
      "num_matricule",
      "conserne",
    ],
  },
  {
    model: TypeCompteMetaFieldValue,
    as: "values",
    include: [{ model: TypeCompteMetaField, as: "metaField" }],
  },
  {
    model: Agent,
    as: "agent",
    attributes: ["id", "nom", "prenom", "email"],
    required: false,
  },
];

const normalizeMetaRows = (values, compteId) => {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return [];
  }

  return Object.entries(values)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    )
    .map(([metaFieldId, value]) => ({
      compte_id: compteId,
      meta_field_id: parseInt(metaFieldId, 10),
      value: value.toString(),
    }))
    .filter((row) => Number.isInteger(row.meta_field_id));
};

const getMetaFieldIds = (values) => {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return [];
  }

  return Object.keys(values)
    .map((id) => parseInt(id, 10))
    .filter(Number.isInteger);
};

const validateMetaFieldsBelongToType = async (
  values,
  typeCompteId,
  transaction,
) => {
  const metaFieldIds = getMetaFieldIds(values);

  if (metaFieldIds.length === 0) {
    return true;
  }

  const count = await TypeCompteMetaField.count({
    where: {
      id: metaFieldIds,
      type_compte_id: typeCompteId,
    },
    transaction,
  });

  return count === metaFieldIds.length;
};

exports.getTypeComptes = async (req, res) => {
  try {
    const types = await TypeCompte.findAll({
      include: [{ model: TypeCompteMetaField, as: "metaFields" }],
      order: [["nom", "ASC"]],
    });

    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  const startTime = Date.now();

  try {
    const { type_compte_id, client_id, values, agent_id } = req.body;

    if (!type_compte_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Le type de compte est requis",
      });
    }

    if (!client_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Le client est requis",
      });
    }

    const [typeCompte, client] = await Promise.all([
      TypeCompte.findByPk(type_compte_id, { transaction: t }),
      Client.findByPk(client_id, { transaction: t }),
    ]);

    if (!typeCompte) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Type de compte introuvable",
      });
    }

    if (!client) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Client introuvable",
      });
    }

    const metaFieldsAreValid = await validateMetaFieldsBelongToType(
      values,
      type_compte_id,
      t,
    );

    if (!metaFieldsAreValid) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Certaines metadonnees ne correspondent pas au type de compte choisi",
      });
    }

    const compte = await Compte.create(
      {
        type_compte_id,
        client_id,
        agent_id: agent_id || req.user?.id || null,
      },
      { transaction: t },
    );

    const metaRows = normalizeMetaRows(values, compte.id);
    if (metaRows.length > 0) {
      await TypeCompteMetaFieldValue.bulkCreate(metaRows, { transaction: t });
    }

    await t.commit();

    const createdCompte = await Compte.findByPk(compte.id, {
      include: compteInclude,
    });

    logger.info("Compte cree avec succes", {
      compteId: compte.id,
      typeCompteId: type_compte_id,
      clientId: client_id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logCreate(req, "compte", createdCompte);

    res.status(201).json({
      success: true,
      message: "Compte cree avec succes",
      data: createdCompte,
    });
  } catch (e) {
    if (!t.finished) {
      await t.rollback();
    }

    logger.error("Erreur creation compte:", {
      error: e.message,
      stack: e.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getAll = async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      type_compte_id,
      client_id,
      agent_id,
      limit = 100,
      offset = 0,
    } = req.query;
    const where = {};

    if (type_compte_id) {
      where.type_compte_id = parseInt(type_compte_id, 10);
    }

    if (client_id) {
      where.client_id = parseInt(client_id, 10);
    }

    if (agent_id) {
      where.agent_id = parseInt(agent_id, 10);
    }

    const { count, rows } = await Compte.findAndCountAll({
      where,
      include: compteInclude,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    logger.info("Comptes recuperes", {
      count: rows.length,
      total: count,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  } catch (e) {
    logger.error("Erreur getAll comptes:", {
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getByClient = async (req, res) => {
  const { clientId } = req.params;

  try {
    const comptes = await Compte.findAll({
      where: { client_id: clientId },
      include: compteInclude,
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: comptes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    const compte = await Compte.findByPk(id, {
      include: compteInclude,
    });

    if (!compte) {
      return res.status(404).json({
        success: false,
        message: "Compte non trouve",
      });
    }

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "compte",
      resource_id: compte.id,
      resource_identifier: `Compte #${compte.id}`,
      description: `Consultation du compte #${compte.id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
        params: req.params,
      },
    });

    res.json({ success: true, data: compte });
  } catch (e) {
    logger.error("Erreur getById compte:", {
      compteId: id,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  const startTime = Date.now();
  const { id } = req.params;

  try {
    const compte = await Compte.findByPk(id, {
      include: [{ model: TypeCompteMetaFieldValue, as: "values" }],
      transaction: t,
    });

    if (!compte) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Compte non trouve",
      });
    }

    const oldCopy = compte.toJSON();
    const { type_compte_id, client_id, values, agent_id } = req.body;
    const nextTypeCompteId = type_compte_id || compte.type_compte_id;
    const nextClientId = client_id || compte.client_id;

    if (type_compte_id && type_compte_id !== compte.type_compte_id) {
      const typeCompte = await TypeCompte.findByPk(type_compte_id, {
        transaction: t,
      });

      if (!typeCompte) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: "Type de compte introuvable",
        });
      }
    }

    if (client_id && client_id !== compte.client_id) {
      const client = await Client.findByPk(client_id, { transaction: t });

      if (!client) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: "Client introuvable",
        });
      }
    }

    const metaFieldsAreValid = await validateMetaFieldsBelongToType(
      values,
      nextTypeCompteId,
      t,
    );

    if (!metaFieldsAreValid) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Certaines metadonnees ne correspondent pas au type de compte choisi",
      });
    }

    await compte.update(
      {
        type_compte_id: nextTypeCompteId,
        client_id: nextClientId,
        agent_id: agent_id !== undefined ? agent_id : compte.agent_id,
      },
      { transaction: t },
    );

    if (type_compte_id && type_compte_id !== oldCopy.type_compte_id) {
      await TypeCompteMetaFieldValue.destroy({
        where: { compte_id: id },
        transaction: t,
      });
    }

    if (values && typeof values === "object" && !Array.isArray(values)) {
      for (const [metaFieldId, value] of Object.entries(values)) {
        const parsedMetaFieldId = parseInt(metaFieldId, 10);
        if (!Number.isInteger(parsedMetaFieldId)) {
          continue;
        }

        const existingValue = await TypeCompteMetaFieldValue.findOne({
          where: {
            compte_id: id,
            meta_field_id: parsedMetaFieldId,
          },
          transaction: t,
        });

        if (value === null || value === undefined || value === "") {
          if (existingValue) {
            await existingValue.destroy({ transaction: t });
          }
          continue;
        }

        if (existingValue) {
          await existingValue.update(
            { value: value.toString() },
            { transaction: t },
          );
        } else {
          await TypeCompteMetaFieldValue.create(
            {
              compte_id: id,
              meta_field_id: parsedMetaFieldId,
              value: value.toString(),
            },
            { transaction: t },
          );
        }
      }
    }

    await t.commit();

    const updatedCompte = await Compte.findByPk(id, {
      include: compteInclude,
    });

    logger.info("Compte mis a jour avec succes", {
      compteId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logUpdate(req, "compte", oldCopy, updatedCompte);

    res.json({
      success: true,
      message: "Compte mis a jour avec succes",
      data: updatedCompte,
    });
  } catch (e) {
    if (!t.finished) {
      await t.rollback();
    }

    logger.error("Erreur update compte:", {
      compteId: id,
      error: e.message,
      stack: e.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.remove = async (req, res) => {
  const t = await sequelize.transaction();
  const startTime = Date.now();
  const { id } = req.params;

  try {
    const compte = await Compte.findByPk(id, { transaction: t });

    if (!compte) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Compte non trouve",
      });
    }

    await TypeCompteMetaFieldValue.destroy({
      where: { compte_id: id },
      transaction: t,
    });
    await compte.destroy({ transaction: t });

    await t.commit();

    logger.info("Compte supprime avec succes", {
      compteId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logDelete(req, "compte", compte);

    res.json({
      success: true,
      message: "Compte supprime avec succes",
    });
  } catch (e) {
    if (!t.finished) {
      await t.rollback();
    }

    logger.error("Erreur remove compte:", {
      compteId: id,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getTypeDocumentsByCompte = async (req, res) => {
  const { id } = req.params;

  try {
    const compte = await Compte.findByPk(id);

    if (!compte) {
      return res.status(404).json({
        success: false,
        message: "Compte non trouve",
      });
    }

    const startTime = Date.now();

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "compte",
      resource_id: compte.id,
      resource_identifier: `Compte #${compte.id}`,
      description: `Consultation du compte #${compte.id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
        params: req.params,
      },
    });

    const typeDocuments = await TypeDocument.findAll({
      where: {
        type_compte_id: compte.type_compte_id,
      },
    });

    return res.json({
      success: true,
      data: typeDocuments,
    });
  } catch (e) {
    logger.error("Erreur getById compte:", {
      compteId: id,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
