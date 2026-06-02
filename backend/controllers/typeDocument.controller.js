const {
  TypeDocument,
  MetaField,
  Pieces,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  DocumentPieces,
  Document,
  TypeDocumentPieces,
  TypeCompte,
  EntityTypeDocumentPiece,
  sequelize,
} = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const Op = require("sequelize").Op;

const CONSERNE_VALUES = ["Personne physique", "Personne morale"];

exports.create = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📝 Tentative de création d'un type de document", {
      userId: req.user?.id,
      body: req.body,
    });

    const { nom, conserne, entitee_un_id, entitee_deux_id, entitee_trois_id } =
      req.body;

    // ✅ Validation de la valeur conserne si présente
    if (conserne && !CONSERNE_VALUES.includes(conserne)) {
      return res.status(400).json({
        message: `La valeur '${conserne}' n'est pas valide. Valeurs acceptées: ${CONSERNE_VALUES.join(", ")}`,
      });
    }

    const count = await TypeDocument.count();

    const nextNumber = count + 1;
    const paddedNumber = nextNumber.toString().padStart(3, "0");
    const code = `TD-${paddedNumber}`;

    const data = await TypeDocument.create({
      code,
      nom,
      conserne: conserne || null, // ✅ Peut être null
      entitee_un_id,
      entitee_deux_id,
      entitee_trois_id,
    });

    logger.info("✅ Type de document créé avec succès", {
      typeId: data.id,
      nom: data.nom,
      conserne: data.conserne,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logCreate(req, "typeDocument", data);

    res.status(201).json(data);
  } catch (e) {
    logger.error("❌ Erreur création typeDocument:", {
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
  const t = await sequelize.transaction();

  try {
    logger.info("📝 Tentative de mise à jour d'un type de document", {
      typeId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldType = await TypeDocument.findByPk(id);
    if (!oldType) {
      logger.warn("⚠️ Type de document non trouvé", {
        typeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Type de document non trouvé" });
    }

    const oldCopy = oldType.toJSON();
    const {
      cote,
      nom,
      code,
      conserne,
      entitee_un_id,
      entitee_deux_id,
      entitee_trois_id,
      division_id,
    } = req.body;

    // ✅ Validation de la valeur conserne si présente
    if (conserne && !CONSERNE_VALUES.includes(conserne)) {
      await t.rollback();
      return res.status(400).json({
        message: `La valeur '${conserne}' n'est pas valide. Valeurs acceptées: ${CONSERNE_VALUES.join(", ")}`,
      });
    }

    // 1. Mettre à jour les colonnes directes
    const [updated] = await TypeDocument.update(
      {
        cote,
        nom,
        code,
        conserne: conserne || null, // ✅ Peut être null
        entitee_un_id,
        entitee_deux_id,
        entitee_trois_id,
        division_id,
      },
      { where: { id }, transaction: t },
    );

    // 2. AJOUTER (sans supprimer) l'association pour entitee_deux
    if (entitee_deux_id) {
      const existing = await sequelize.query(
        `SELECT * FROM entitee_deux_type_documents WHERE type_document_id = ? AND entitee_deux_id = ?`,
        {
          replacements: [id, entitee_deux_id],
          transaction: t,
          type: sequelize.QueryTypes.SELECT,
        },
      );

      if (existing.length === 0) {
        await sequelize.query(
          `INSERT INTO entitee_deux_type_documents (entitee_deux_id, type_document_id, created_at, updated_at)
           VALUES (?, ?, NOW(), NOW())`,
          {
            replacements: [entitee_deux_id, id],
            transaction: t,
            type: sequelize.QueryTypes.INSERT,
          },
        );
        console.log(
          `✅ Association ajoutée: type ${id} -> entitee_deux ${entitee_deux_id}`,
        );
      } else {
        console.log(
          `ℹ️ Association existante: type ${id} -> entitee_deux ${entitee_deux_id}`,
        );
      }
    }

    // 3. AJOUTER (sans supprimer) l'association pour entitee_un
    if (entitee_un_id) {
      const existing = await sequelize.query(
        `SELECT * FROM entitee_un_type_documents WHERE type_document_id = ? AND entitee_un_id = ?`,
        {
          replacements: [id, entitee_un_id],
          transaction: t,
          type: sequelize.QueryTypes.SELECT,
        },
      );

      if (existing.length === 0) {
        await sequelize.query(
          `INSERT INTO entitee_un_type_documents (entitee_un_id, type_document_id, created_at, updated_at)
           VALUES (?, ?, NOW(), NOW())`,
          {
            replacements: [entitee_un_id, id],
            transaction: t,
            type: sequelize.QueryTypes.INSERT,
          },
        );
        console.log(
          `✅ Association ajoutée: type ${id} -> entitee_un ${entitee_un_id}`,
        );
      }
    }

    // 4. AJOUTER (sans supprimer) l'association pour entitee_trois
    if (entitee_trois_id) {
      const existing = await sequelize.query(
        `SELECT * FROM entitee_trois_type_documents WHERE type_document_id = ? AND entitee_trois_id = ?`,
        {
          replacements: [id, entitee_trois_id],
          transaction: t,
          type: sequelize.QueryTypes.SELECT,
        },
      );

      if (existing.length === 0) {
        await sequelize.query(
          `INSERT INTO entitee_trois_type_documents (entitee_trois_id, type_document_id, created_at, updated_at)
           VALUES (?, ?, NOW(), NOW())`,
          {
            replacements: [entitee_trois_id, id],
            transaction: t,
            type: sequelize.QueryTypes.INSERT,
          },
        );
        console.log(
          `✅ Association ajoutée: type ${id} -> entitee_trois ${entitee_trois_id}`,
        );
      }
    }

    await t.commit();

    const updatedType = await TypeDocument.findByPk(id, {
      include: [
        { model: EntiteeUn, as: "entitee_un", through: { attributes: [] } },
        { model: EntiteeDeux, as: "entitee_deux", through: { attributes: [] } },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          through: { attributes: [] },
        },
      ],
    });

    logger.info("✅ Type de document mis à jour avec succès", {
      typeId: id,
      cote: updatedType.cote,
      nom: updatedType.nom,
      conserne: updatedType.conserne,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logUpdate(
      req,
      "typeDocument",
      oldCopy,
      updatedType,
    );

    res.json({
      success: true,
      message: "Mise à jour réussie",
      data: updatedType,
    });
  } catch (e) {
    if (t) await t.rollback();
    logger.error("❌ Erreur mise à jour typeDocument:", {
      typeId: id,
      error: e.message,
      stack: e.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de tous les types de documents", {
      userId: req.user?.id,
      query: req.query,
    });

    const data = await TypeDocument.findAll({
      include: [
        { model: MetaField, as: "metaFields" },
        {
          model: EntiteeUn,
          as: "entitee_un",
          through: { attributes: [] },
          attributes: ["id", "libelle", "code", "titre"],
          required: false,
        },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          through: { attributes: [] },
          attributes: ["id", "libelle", "code", "titre"],
          required: false,
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          through: { attributes: [] },
          attributes: ["id", "libelle", "code", "titre"],
          required: false,
        },
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
          through: { attributes: [] },
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Log pour déboguer les associations
    console.log("📊 === TYPES AVEC ASSOCIATIONS ===");
    data.forEach((td) => {
      console.log(`Type ${td.id}: ${td.nom}`);
      console.log(`  conserne: ${td.conserne || "Non spécifié"}`);
      console.log(
        `  entitee_un: ${td.entitee_un?.map((e) => `${e.id} (${e.libelle})`).join(", ") || "aucune"}`,
      );
      console.log(
        `  entitee_deux: ${td.entitee_deux?.map((e) => `${e.id} (${e.libelle})`).join(", ") || "aucune"}`,
      );
      console.log(
        `  entitee_trois: ${td.entitee_trois?.map((e) => `${e.id} (${e.libelle})`).join(", ") || "aucune"}`,
      );
    });

    const formatted = data.map((td) => {
      const entiteeUnArray = td.entitee_un || [];
      const entiteeDeuxArray = td.entitee_deux || [];
      const entiteeTroisArray = td.entitee_trois || [];

      const entiteeUnFirst = entiteeUnArray[0] || null;
      const entiteeDeuxFirst = entiteeDeuxArray[0] || null;
      const entiteeTroisFirst = entiteeTroisArray[0] || null;

      const entiteeConcernee =
        entiteeTroisFirst || entiteeDeuxFirst || entiteeUnFirst;

      return {
        id: td.id,
        cote: td.cote,
        code: td.code,
        nom: td.nom,
        conserne: td.conserne || null, // ✅ Ajout du champ conserne
        entitee_un_id: entiteeUnFirst?.id || td.entitee_un_id || null,
        entitee_deux_id: entiteeDeuxFirst?.id || td.entitee_deux_id || null,
        entitee_trois_id: entiteeTroisFirst?.id || td.entitee_trois_id || null,
        structure_libelle: entiteeConcernee
          ? entiteeConcernee.libelle
          : "Non assigné",
        entitee_un: entiteeUnArray,
        entitee_deux: entiteeDeuxArray,
        entitee_trois: entiteeTroisArray,
        metaFields: td.metaFields || [],
        pieces: (td.pieces || []).map((p) => ({
          id: p.id,
          libelle: p.libelle,
          code_pieces: p.code_pieces,
        })),
        createdAt: td.createdAt,
        updatedAt: td.updatedAt,
      };
    });

    logger.info("✅ Types de documents récupérés", {
      count: formatted.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "typeDocument",
        resource_id: null,
        resource_identifier: "liste des types de documents",
        description: "Consultation de la liste des types de documents",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: formatted.length,
          duration: Date.now() - startTime,
        },
      });
    }

    res.json(formatted);
  } catch (e) {
    logger.error("❌ Erreur getAll typeDocument:", {
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Recherche d'un type de document par ID", {
      typeId: id,
      userId: req.user?.id,
    });

    const data = await TypeDocument.findByPk(id, {
      include: [
        {
          model: EntiteeUn,
          as: "entitee_un",
          through: { attributes: [] },
          required: false,
        },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          through: { attributes: [] },
          required: false,
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
          through: { attributes: [] },
          required: false,
        },
        { model: MetaField, as: "metaFields" },
      ],
    });

    if (!data) {
      logger.warn("⚠️ Type de document non trouvé", {
        typeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Not found" });
    }

    logger.info("✅ Type de document trouvé", {
      typeId: id,
      nom: data.nom,
      conserne: data.conserne,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "typeDocument",
      resource_id: data.id,
      resource_identifier: `${data.nom} (${data.id})`,
      description: `Consultation du type de document #${data.id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
      },
    });

    res.json(data);
  } catch (e) {
    logger.error("❌ Erreur getById typeDocument:", {
      typeId: id,
      error: e.message,
      stack: e.stack,
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
    logger.info("🗑️ Tentative de suppression d'un type de document", {
      typeId: id,
      userId: req.user?.id,
    });

    const typeDoc = await TypeDocument.findByPk(id);
    if (!typeDoc) {
      logger.warn("⚠️ Type de document non trouvé pour suppression", {
        typeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Type de document non trouvé" });
    }

    const allDocument = await Document.findAll();
    const allTypeDocumentPiece = await TypeDocumentPieces.findAll();

    for (const doc of allDocument) {
      if (doc.type_document_id === typeDoc.id) {
        return res.status(400).json({
          message:
            "Impossible de supprimer : ce type contient des documents ou des pièces associées.",
        });
      }
    }

    for (const piece of allTypeDocumentPiece) {
      if (piece.type_document_id === typeDoc.id) {
        return res.status(400).json({
          message:
            "Impossible de supprimer : ce type contient des documents ou des pièces associées.",
        });
      }
    }

    await TypeDocument.destroy({ where: { id } });

    logger.info("✅ Type de document supprimé avec succès", {
      typeId: id,
      cote: typeDoc.cote,
      nom: typeDoc.nom,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logDelete(req, "typeDocument", typeDoc);

    res.json({ success: true });
  } catch (e) {
    logger.error("❌ Erreur suppression typeDocument:", {
      typeId: id,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.addPiecesToTypeDocument = async (req, res) => {
  const startTime = Date.now();
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { pieces } = req.body;

    logger.info("📝 Tentative d'ajout de pièces à un type de document", {
      typeId: id,
      piecesCount: pieces.length,
      userId: req.user?.id,
    });

    const typeDocument = await TypeDocument.findByPk(id);
    if (!typeDocument) {
      logger.warn("⚠️ Type de document non trouvé", {
        typeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Type de document introuvable" });
    }

    for (const p of pieces) {
      await typeDocument.addPiece(p.piece, {
        through: {
          disponible: p.disponible ?? false,
        },
        transaction: t,
      });
    }

    await t.commit();

    logger.info("✅ Pièces ajoutées au type de document", {
      typeId: id,
      piecesCount: pieces.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "update",
      resource: "typeDocument_pieces",
      resource_id: id,
      resource_identifier: `${typeDocument.nom} (${id})`,
      description: `Ajout de ${pieces.length} pièce(s) au type de document`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        piecesCount: pieces.length,
        duration: Date.now() - startTime,
      },
    });

    res.json({ message: "Pièces ajoutées avec succès" });
  } catch (err) {
    if (t) await t.rollback();
    logger.error("❌ Erreur addPiecesToTypeDocument:", {
      typeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: err.message });
  }
};

exports.removePieceFromTypeDocument = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;
  const { pieceId } = req.body;

  try {
    logger.info("🗑️ Tentative de retrait d'une pièce d'un type de document", {
      typeId: id,
      pieceId,
      userId: req.user?.id,
    });

    const typeDocument = await TypeDocument.findByPk(id);
    if (!typeDocument) {
      logger.warn("⚠️ Type de document non trouvé", {
        typeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Type de document introuvable" });
    }

    await typeDocument.removePiece(pieceId);

    logger.info("✅ Pièce retirée du type de document", {
      typeId: id,
      pieceId,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "update",
      resource: "typeDocument_pieces",
      resource_id: id,
      resource_identifier: `${typeDocument.nom} (${id})`,
      description: `Retrait d'une pièce du type de document`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        pieceId,
        duration: Date.now() - startTime,
      },
    });

    res.json({ message: "Pièce supprimée avec succès" });
  } catch (err) {
    logger.error("❌ Erreur removePieceFromTypeDocument:", {
      typeId: id,
      pieceId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: err.message });
  }
};

exports.getPiecesOfTypeDocument = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des pièces d'un type de document", {
      typeId: id,
      userId: req.user?.id,
    });

    const typeDocument = await TypeDocument.findByPk(id, {
      include: [
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
        },
      ],
    });

    if (!typeDocument) {
      logger.warn("⚠️ Type de document non trouvé", {
        typeId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Type de document introuvable" });
    }

    logger.info("✅ Pièces du type de document récupérées", {
      typeId: id,
      count: typeDocument.pieces?.length || 0,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(typeDocument.pieces);
  } catch (err) {
    logger.error("❌ Erreur getPiecesOfTypeDocument:", {
      typeId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: err.message });
  }
};

exports.addPieceToEntityTypeDocument = async (req, res) => {
  try {
    const { typeDocumentId } = req.params;
    const { entity_type, entity_id, piece_id } = req.body;

    const globalLink = await TypeDocumentPieces.findOne({
      where: {
        document_type_id: typeDocumentId,
        piece_id,
      },
    });

    const existing = await EntityTypeDocumentPiece.findOne({
      where: {
        type_document_id: typeDocumentId,
        entity_type,
        entity_id,
        piece_id,
      },
    });

    if (globalLink) {
      console.log("CAS GLOBAL DETECTÉ");

      if (existing) {
        await existing.destroy();
      }

      return res.json({
        message: "Pièce globale restaurée (suppression override)",
      });
    }

    console.log("CAS NON GLOBAL");

    if (existing) {
      if (existing.action === "ADD") {
        return res.json({
          message: "Pièce déjà ajoutée",
        });
      }

      existing.action = "ADD";
      await existing.save();

      return res.json({
        message: "Pièce réajoutée avec succès",
      });
    }

    await EntityTypeDocumentPiece.create({
      type_document_id: typeDocumentId,
      entity_type,
      entity_id,
      piece_id,
      action: "ADD",
    });

    return res.json({
      message: "Pièce ajoutée à l'entité",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  } finally {
    console.log("===== END REQUEST =====");
  }
};

exports.removePieceFromEntityTypeDocument = async (req, res) => {
  try {
    const { typeDocumentId } = req.params;
    const { entity_type, entity_id, piece_id } = req.body;

    const existing = await EntityTypeDocumentPiece.findOne({
      where: {
        type_document_id: typeDocumentId,
        entity_type,
        entity_id,
        piece_id,
      },
    });

    if (existing) {
      if (existing.action === "REMOVE") {
        return res.json({
          message: "Pièce déjà retirée",
        });
      }

      existing.action = "REMOVE";
      await existing.save();

      return res.json({
        message: "Pièce retirée avec succès",
      });
    }

    await EntityTypeDocumentPiece.create({
      type_document_id: typeDocumentId,
      entity_type,
      entity_id,
      piece_id,
      action: "REMOVE",
    });

    return res.json({
      message: "Pièce retirée pour cette entité",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.getEffectivePiecesForEntity = async (req, res) => {
  try {
    const { typeDocumentId, entityType, entityId } = req.params;

    const typeDocument = await TypeDocument.findByPk(typeDocumentId, {
      include: [{ model: Pieces, as: "pieces" }],
    });

    const basePieces = typeDocument.pieces || [];

    const added = await EntityTypeDocumentPiece.findAll({
      where: {
        type_document_id: typeDocumentId,
        entity_type: entityType,
        entity_id: entityId,
        action: "ADD",
      },
    });

    const removed = await EntityTypeDocumentPiece.findAll({
      where: {
        type_document_id: typeDocumentId,
        entity_type: entityType,
        entity_id: entityId,
        action: "REMOVE",
      },
    });

    const addedPieceIds = added.map((a) => a.piece_id);
    const removedPieceIds = removed.map((r) => r.piece_id);

    const addedPieces = await Pieces.findAll({
      where: { id: addedPieceIds },
    });

    res.json({
      basePieces,
      addedPieces,
      removedPieceIds,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ Récupérer les types de documents dont conserne n'est pas null
 */
exports.getTypesWithConserne = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug(
      "🔍 Récupération des types de documents avec conserne non null",
      {
        userId: req.user?.id,
        query: req.query,
      },
    );

    const { limit = 100, offset = 0 } = req.query;

    const where = {
      conserne: {
        [Op.ne]: null,
      },
    };

    const { count, rows } = await TypeDocument.findAndCountAll({
      where,
      include: [
        {
          model: TypeCompte,
          as: "type_compte",
          attributes: ["id", "nom"],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    logger.info("✅ Types de documents avec conserne récupérés", {
      count: rows.length,
      total: count,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "typeDocument",
        resource_id: null,
        resource_identifier: "liste des types avec conserne",
        description: "Consultation des types de documents ayant un conserne",
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
    logger.error("❌ Erreur récupération types avec conserne:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des types de documents",
      error: err.message,
    });
  }
};

/**
 * ✅ Affecter un type de compte à un type de document
 */
exports.assignTypeCompteToTypeDocument = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;
  const { type_compte_id } = req.body;

  try {
    logger.info(
      "📝 Tentative d'affectation d'un type de compte à un type de document",
      {
        typeDocumentId: id,
        typeCompteId: type_compte_id,
        userId: req.user?.id,
      },
    );

    // Vérifier si le type de document existe
    const typeDocument = await TypeDocument.findByPk(id);
    if (!typeDocument) {
      logger.warn("⚠️ Type de document non trouvé", {
        typeDocumentId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Type de document non trouvé",
      });
    }

    const oldCopy = typeDocument.toJSON();

    // Si type_compte_id est null, on supprime l'association
    if (type_compte_id === null || type_compte_id === undefined) {
      await typeDocument.update({ type_compte_id: null });

      logger.info("✅ Association supprimée", {
        typeDocumentId: id,
        userId: req.user?.id,
        duration: Date.now() - startTime,
      });

      const updatedTypeDocument = await TypeDocument.findByPk(id, {
        include: [
          {
            model: TypeCompte,
            as: "type_compte",
            attributes: ["id", "nom"],
          },
        ],
      });

      await HistoriqueService.logUpdate(
        req,
        "typeDocument",
        oldCopy,
        updatedTypeDocument,
      );

      return res.json({
        success: true,
        message: "Type de compte dissocié du type de document avec succès",
        data: updatedTypeDocument,
      });
    }

    // Vérifier si le type de compte existe
    const typeCompte = await TypeCompte.findByPk(type_compte_id);
    if (!typeCompte) {
      logger.warn("⚠️ Type de compte non trouvé", {
        typeCompteId: type_compte_id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Type de compte non trouvé",
      });
    }

    // Mettre à jour le type de document
    await typeDocument.update({ type_compte_id });

    logger.info("✅ Type de compte affecté au type de document", {
      typeDocumentId: id,
      typeCompteId: type_compte_id,
      typeCompteNom: typeCompte.nom,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    const updatedTypeDocument = await TypeDocument.findByPk(id, {
      include: [
        {
          model: TypeCompte,
          as: "type_compte",
          attributes: ["id", "nom"],
        },
      ],
    });

    await HistoriqueService.logUpdate(
      req,
      "typeDocument",
      oldCopy,
      updatedTypeDocument,
    );

    res.json({
      success: true,
      message: "Type de compte affecté avec succès",
      data: updatedTypeDocument,
    });
  } catch (err) {
    logger.error("❌ Erreur affectation type de compte:", {
      typeDocumentId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'affectation du type de compte",
      error: err.message,
    });
  }
};
