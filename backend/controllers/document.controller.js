// controllers/document.controller.js
const {
  Document,
  DocumentValue,
  MetaField,
  DocumentFile,
  TypeDocument,
  TypeDocumentPieces,
  DocumentFichier,
  DocumentPieces,
  Pieces,
  PiecesFichier,
  sequelize,
  PieceValue,
  PieceMetaField,
  DocumentEntity,
  Agent,
} = require("../models");
const buildAccessWhere = require("../utils/buildAccessWhere.utils");
const path = require("path");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const fs = require("fs");

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  const startTime = Date.now();

  try {
    const { type_document_id, values, piece_values, entities } = req.body;

    if (!type_document_id) {
      return res
        .status(400)
        .json({ message: "Le type de document est requis" });
    }

    // ✅ Validation de l'entité
    if (
      !entities ||
      !entities.length ||
      !entities[0].entity_type ||
      !entities[0].entity_id
    ) {
      return res.status(400).json({
        message: "entities avec entity_type et entity_id est requis",
      });
    }

    const entity = entities[0];

    // 1. Créer le document
    const doc = await Document.create({ type_document_id }, { transaction: t });

    // 2. LIAISON DOCUMENT → ENTITÉ
    await DocumentEntity.create(
      {
        document_id: doc.id,
        entity_type: entity.entity_type,
        entity_id: entity.entity_id,
      },
      { transaction: t },
    );

    // 3. Associer les pièces du type
    const typeDocumentPieces = await TypeDocumentPieces.findAll({
      where: { document_type_id: type_document_id },
      transaction: t,
    });

    if (typeDocumentPieces.length > 0) {
      const pieceRows = typeDocumentPieces.map((tp) => ({
        document_id: doc.id,
        piece_id: tp.piece_id,
        disponible: false,
      }));
      await DocumentPieces.bulkCreate(pieceRows, { transaction: t });
    }

    // 4. Meta values du document
    if (values && Object.keys(values).length > 0) {
      const metaRows = Object.entries(values)
        .filter(
          ([_, value]) => value !== null && value !== undefined && value !== "",
        )
        .map(([meta_field_id, value]) => ({
          document_id: doc.id,
          meta_field_id: parseInt(meta_field_id),
          value: value.toString(),
        }));

      if (metaRows.length > 0) {
        await DocumentValue.bulkCreate(metaRows, { transaction: t });
      }
    }

    // 5. Valeurs des métadonnées des pièces
    if (piece_values && Object.keys(piece_values).length > 0) {
      const pieceValueRows = [];
      for (const [pieceId, metaFields] of Object.entries(piece_values)) {
        if (metaFields && typeof metaFields === "object") {
          for (const [metaFieldId, value] of Object.entries(metaFields)) {
            if (value !== null && value !== undefined && value !== "") {
              pieceValueRows.push({
                document_id: doc.id,
                piece_id: parseInt(pieceId),
                piece_meta_field_id: parseInt(metaFieldId),
                value: value?.toString() || null,
              });
            }
          }
        }
      }
      if (pieceValueRows.length > 0) {
        await PieceValue.bulkCreate(pieceValueRows, { transaction: t });
      }
    }

    await t.commit();

    await HistoriqueService.logCreate(req, "document", doc);

    res.status(201).json({
      message: "Document créé avec succès",
      id: doc.id,
      type_document_id: doc.type_document_id,
    });
  } catch (e) {
    if (t) await t.rollback();
    console.error("❌ Erreur create document:", e);
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de tous les documents", {
      userId: req.user?.id,
      query: req.query,
    });

    const { entity_type, entity_id } = req.query;

    const data = await Document.findAll({
      include: [
        {
          model: DocumentEntity,
          as: "entities",
          where:
            entity_type && entity_id
              ? {
                  entity_type,
                  entity_id,
                }
              : undefined,
        },
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
          include: [
            { model: DocumentFichier, as: "documentFichiers" },
            { model: PieceMetaField, as: "metaFields" },
          ],
        },
        {
          model: TypeDocument,
          as: "typeDocument",
          include: [{ model: MetaField, as: "metaFields" }],
        },
        {
          model: DocumentValue,
          as: "values",
          include: [
            { model: MetaField, as: "metaField" },
            { model: DocumentFile, as: "files" },
            { model: DocumentFichier, as: "file" },
          ],
        },
      ],
    });

    logger.info("✅ Documents récupérés", {
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "document",
        resource_id: null,
        resource_identifier: "liste des documents",
        description: "Consultation de la liste des documents",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: data.length,
          duration: Date.now() - startTime,
        },
      });
    }

    res.json(data);
  } catch (e) {
    logger.error("❌ Erreur getAll documents:", {
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
    logger.debug("🔍 Recherche d'un document par ID", {
      documentId: id,
      userId: req.user?.id,
    });

    const data = await Document.findByPk(id, {
      include: [
        {
          model: TypeDocument,
          as: "typeDocument",
          include: [{ model: MetaField, as: "metaFields" }],
        },
        {
          model: DocumentValue,
          as: "values",
          include: [
            { model: MetaField, as: "metaField" },
            { model: DocumentFile, as: "files" },
            { model: DocumentFichier, as: "file" },
          ],
        },
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
          through: {
            model: DocumentPieces,
            attributes: ["disponible"],
          },
          include: [
            { model: DocumentFichier, as: "documentFichiers" },
            { model: PieceMetaField, as: "metaFields" },
          ],
        },
        {
          model: DocumentEntity,
          as: "entities",
        },
      ],
    });

    if (!data) {
      logger.warn("⚠️ Document non trouvé", {
        documentId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Not found" });
    }

    logger.info("✅ Document trouvé", {
      documentId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour la consultation d'un document spécifique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "document",
      resource_id: data.id,
      resource_identifier: `Document #${data.id}`,
      description: `Consultation du document #${data.id}`,
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

    res.json(data);
  } catch (e) {
    logger.error("❌ Erreur getById:", {
      documentId: id,
      error: e.message,
      stack: e.stack,
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
    logger.info("📝 Tentative de modification d'un document", {
      documentId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldDoc = await Document.findByPk(id, {
      include: [
        { model: DocumentValue, as: "values" },
        { model: Agent, as: "agent" },
      ],
    });

    if (!oldDoc) {
      logger.warn("⚠️ Document non trouvé pour modification", {
        documentId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Document non trouvé" });
    }

    const { values } = req.body;

    // ✅ Gestion des différents formats possibles
    if (values) {
      if (Array.isArray(values)) {
        // Format tableau avec IDs (attendu pour les mises à jour)
        for (const v of values) {
          if (v && v.id && v.value !== undefined) {
            await DocumentValue.update(
              { value: v.value },
              { where: { id: v.id } },
            );
          }
        }
      } else if (typeof values === "object") {
        // Format objet { meta_field_id: value }
        for (const [metaFieldId, value] of Object.entries(values)) {
          // Chercher si une valeur existe déjà
          const existingValue = await DocumentValue.findOne({
            where: {
              document_id: id,
              meta_field_id: metaFieldId,
            },
          });

          if (existingValue) {
            // Mise à jour
            await existingValue.update({ value: String(value) });
          } else {
            // Création (pour les nouveaux champs)
            await DocumentValue.create({
              document_id: id,
              meta_field_id: metaFieldId,
              value: String(value),
            });
          }
        }
      } else {
        logger.warn("⚠️ Format de values non supporté", {
          documentId: id,
          valuesType: typeof values,
        });
        return res.status(400).json({
          message: "Format de valeurs non supporté",
        });
      }
    }

    const updatedDoc = await Document.findByPk(id, {
      include: [{ model: DocumentValue, as: "values" }],
    });

    logger.info("✅ Document modifié avec succès", {
      documentId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logUpdate(req, "document", oldDoc, updatedDoc);

    res.json({ success: true, data: updatedDoc });
  } catch (e) {
    logger.error("❌ Erreur update document:", {
      documentId: id,
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
    logger.info("🗑️ Tentative de suppression d'un document", {
      documentId: id,
      userId: req.user?.id,
    });

    const doc = await Document.findByPk(id);
    if (!doc) {
      logger.warn("⚠️ Document non trouvé pour suppression", {
        documentId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Document non trouvé" });
    }

    await DocumentEntity.destroy({ where: { document_id: id } });
    await DocumentValue.destroy({ where: { document_id: id } });
    await Document.destroy({ where: { id } });

    logger.info("✅ Document supprimé avec succès", {
      documentId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "document", doc);

    res.json({ success: true });
  } catch (e) {
    logger.error("❌ Erreur remove document:", {
      documentId: id,
      error: e.message,
      stack: e.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: e.message });
  }
};

exports.uploadDocumentFiles = async (req, res) => {
  const t = await sequelize.transaction();
  const startTime = Date.now();
  const { documentId, pieceId } = req.params;

  try {
    logger.info("📤 Upload de fichiers pour document", {
      documentId,
      pieceId,
      userId: req.user?.id,
    });

    const { piece_value_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    const documentValues = await DocumentValue.findAll({
      where: { document_id: documentId },
      attributes: ["id"],
      transaction: t,
    });

    const documentValueIds = documentValues.map((dv) => dv.id);

    console.log("Document value IDs trouvées:", documentValueIds);

    const uploadedFiles = [];

    for (const file of files) {
      const publicPath = file.path
        .replace(/\\/g, "/")
        .replace(/^.*uploads\//, "uploads/");

      const fileName = file.filename || path.basename(file.path);

      const document_value_id =
        documentValueIds.length > 0 ? documentValueIds[0] : null;

      const docFichier = await DocumentFichier.create(
        {
          document_id: documentId,
          piece_id: pieceId,
          piece_value_id: piece_value_id || null,
          document_value_id: document_value_id,
          fichier: publicPath,
          original_name: file.originalname,
          new_file_name: fileName,
          mode: "INDIVIDUEL",
        },
        { transaction: t },
      );

      uploadedFiles.push(docFichier);
    }

    await t.commit();

    logger.info("✅ Fichiers uploadés avec succès", {
      documentId,
      pieceId,
      count: uploadedFiles.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "upload",
      resource: "document_fichier",
      resource_id: null,
      resource_identifier: `Upload de ${uploadedFiles.length} fichier(s)`,
      description: `Upload de ${uploadedFiles.length} fichier(s) pour le document #${documentId}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        count: uploadedFiles.length,
        files: uploadedFiles.map((f) => ({ id: f.id, name: f.original_name })),
        duration: Date.now() - startTime,
      },
    });

    res.json({
      message: "Fichiers ajoutés avec succès",
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (err) {
    await t.rollback();
    logger.error("❌ Erreur upload:", {
      documentId,
      pieceId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de l'upload",
      error: err.message,
    });
  }
};

exports.uploadPieceFile = async (req, res) => {
  const t = await sequelize.transaction();
  const startTime = Date.now();
  const { documentId, pieceId } = req.params;

  try {
    logger.info("📤 Upload de fichier pour métadonnée de pièce", {
      documentId,
      pieceId,
      userId: req.user?.id,
    });

    const { piece_value_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    if (!piece_value_id) {
      await t.rollback();
      return res.status(400).json({
        message: "piece_value_id est requis",
      });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const publicPath = file.path
        .replace(/\\/g, "/")
        .replace(/^.*uploads\//, "uploads/");

      const fileName = path.basename(file.path);

      const docFichier = await PiecesFichier.create(
        {
          document_id: documentId,
          piece_id: pieceId,
          piece_value_id: piece_value_id,
          fichier: publicPath,
          new_file_name: fileName,
          original_name: file.originalname,
          mode: "INDIVIDUEL",
        },
        { transaction: t },
      );

      uploadedFiles.push(docFichier);
    }

    await t.commit();

    logger.info("✅ Fichier uploadé avec succès", {
      documentId,
      pieceId,
      piece_value_id,
      count: uploadedFiles.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "upload",
      resource: "document_fichier",
      resource_id: null,
      resource_identifier: `Upload de ${uploadedFiles.length} fichier(s)`,
      description: `Upload de fichier pour métadonnée de pièce #${pieceId} du document #${documentId}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        count: uploadedFiles.length,
        piece_value_id,
        duration: Date.now() - startTime,
      },
    });

    res.json({
      message: "Fichier(s) uploadé(s) avec succès",
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (err) {
    await t.rollback();
    logger.error("❌ Erreur uploadPieceFile:", {
      documentId,
      pieceId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de l'upload du fichier",
      error: err.message,
    });
  }
};

exports.uploadLotUniqueWithPieces = async (req, res) => {
  const t = await sequelize.transaction();
  const startTime = Date.now();
  const { documentId } = req.params;

  try {
    logger.info("📦 Upload lot unique avec pièces", {
      documentId,
      userId: req.user?.id,
    });

    const { piece_ids } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    const piecesToAssociate = piece_ids ? JSON.parse(piece_ids) : [];
    const uploadedFiles = [];

    for (const file of files) {
      const publicPath = file.path
        .replace(/\\/g, "/")
        .replace(/^.*uploads\//, "uploads/");

      const fileName = path.basename(file.path);

      if (piecesToAssociate.length > 0) {
        for (const pieceId of piecesToAssociate) {
          const docFichier = await DocumentFichier.create(
            {
              document_id: documentId,
              piece_id: pieceId,
              fichier: publicPath,
              new_file_name: fileName,
              original_name: file.originalname,
              mode: "LOT_UNIQUE",
            },
            { transaction: t },
          );

          const [docPiece, created] = await DocumentPieces.findOrCreate({
            where: {
              document_id: documentId,
              piece_id: pieceId,
            },
            defaults: { disponible: true },
            transaction: t,
          });

          if (!created && docPiece.disponible !== true) {
            docPiece.disponible = true;
            await docPiece.save({ transaction: t });
          }

          uploadedFiles.push(docFichier);
        }
      } else {
        const docFichier = await DocumentFichier.create(
          {
            document_id: documentId,
            piece_id: null,
            fichier: publicPath,
            new_file_name: fileName,
            original_name: file.originalname,
            mode: "LOT_UNIQUE",
          },
          { transaction: t },
        );
        uploadedFiles.push(docFichier);
      }
    }

    await t.commit();

    logger.info("✅ Upload lot unique terminé", {
      documentId,
      associatedPieces: piecesToAssociate.length,
      filesCount: uploadedFiles.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "upload",
      resource: "document_fichier",
      resource_id: null,
      resource_identifier: `Upload lot unique avec ${piecesToAssociate.length} pièce(s)`,
      description: `Upload lot unique pour document #${documentId} avec ${piecesToAssociate.length} pièce(s) associée(s)`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        associatedPieces: piecesToAssociate.length,
        filesCount: uploadedFiles.length,
        duration: Date.now() - startTime,
      },
    });

    res.json({
      message:
        piecesToAssociate.length > 0
          ? `Fichier uploadé et associé à ${piecesToAssociate.length} pièce(s)`
          : "Fichier uploadé sans association",
      files: uploadedFiles,
      associatedPieces: piecesToAssociate.length,
    });
  } catch (err) {
    await t.rollback();
    logger.error("❌ Erreur upload lot avec pièces:", {
      documentId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: err.message });
  }
};

exports.updateDocumentPieceDisponibilite = async (req, res) => {
  const startTime = Date.now();
  const { documentId, pieceId } = req.params;

  try {
    logger.info("🔄 Mise à jour disponibilité pièce", {
      documentId,
      pieceId,
      userId: req.user?.id,
      disponible: req.body.disponible,
    });

    const { disponible } = req.body;

    const [doc, created] = await DocumentPieces.findOrCreate({
      where: {
        document_id: documentId,
        piece_id: pieceId,
      },
      defaults: { disponible: false },
    });

    if (!doc) {
      return res
        .status(404)
        .json({ message: "Relation document/pièce introuvable" });
    }

    doc.disponible = disponible;
    await doc.save();

    logger.info("✅ Disponibilité mise à jour", {
      documentId,
      pieceId,
      disponible: doc.disponible,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "update",
      resource: "document_pieces",
      resource_id: doc.id,
      resource_identifier: `Pièce #${pieceId} du document #${documentId}`,
      description: `Mise à jour disponibilité: ${disponible ? "disponible" : "non disponible"}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        disponible: doc.disponible,
        duration: Date.now() - startTime,
      },
    });

    return res.json({
      message: "Disponibilité mise à jour",
      disponible: doc.disponible,
    });
  } catch (error) {
    logger.error("❌ Erreur update disponibilité:", {
      documentId,
      pieceId,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    return res.status(500).json({ message: "Erreur update disponibilité" });
  }
};

exports.getDocumentFiles = async (req, res) => {
  const startTime = Date.now();
  const { documentId, pieceId } = req.params;

  try {
    logger.debug("🔍 Récupération des fichiers d'une pièce", {
      documentId,
      pieceId,
      userId: req.user?.id,
    });

    const files = await DocumentFichier.findAll({
      where: {
        document_id: documentId,
        piece_id: pieceId,
      },
      order: [["created_at", "DESC"]],
    });

    logger.info("✅ Fichiers récupérés", {
      documentId,
      pieceId,
      count: files.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    return res.json(files);
  } catch (error) {
    logger.error("❌ getPieceFiles error:", {
      documentId,
      pieceId,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    return res.status(500).json({
      message: "Erreur lors de la récupération des fichiers",
    });
  }
};

exports.getDocumentPieces = async (req, res) => {
  const startTime = Date.now();
  const { documentId } = req.params;

  try {
    logger.debug("🔍 Récupération des pièces d'un document", {
      documentId,
      userId: req.user?.id,
    });

    const document = await Document.findByPk(documentId, {
      include: [
        {
          model: TypeDocument,
          include: [
            {
              model: Pieces,
              as: "pieces",
              attributes: ["id", "libelle", "code_pieces"],
              through: {
                model: TypeDocumentPieces,
                attributes: [],
              },
              include: [
                {
                  model: DocumentFichier,
                  as: "fichiers",
                  where: { document_id: documentId },
                  required: false,
                  attributes: ["id", "fichier", "original_name", "createdAt"],
                },
                {
                  model: PieceMetaField,
                  as: "metaFields",
                  attributes: [
                    "id",
                    "label",
                    "name",
                    "field_type",
                    "required",
                    "position",
                  ],
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
          through: {
            model: DocumentPieces,
            attributes: ["disponible"],
          },
        },
      ],
    });

    if (!document) {
      logger.warn("⚠️ Document non trouvé", {
        documentId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "document introuvable" });
    }

    const pieces = document.TypeDocument.Pieces.map((p) => ({
      id: p.id,
      libelle: p.libelle,
      code_pieces: p.code_pieces,
      disponible: p.document_pieces?.disponible ?? false,
      fichiers: p.fichiers || [],
      metaFields: p.metaFields || [],
    }));

    logger.info("✅ Pièces du document récupérées", {
      documentId,
      count: pieces.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({ pieces });
  } catch (error) {
    logger.error("🔥 getDocumentPieces error:", {
      documentId,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getLotUniqueFiles = async (req, res) => {
  const startTime = Date.now();
  const { documentId } = req.params;

  try {
    logger.debug("🔍 Récupération des fichiers lot unique", {
      documentId,
      userId: req.user?.id,
    });

    const files = await DocumentFichier.findAll({
      where: {
        document_id: documentId,
        mode: "LOT_UNIQUE",
      },
      order: [["created_at", "DESC"]],
    });

    logger.info("✅ Fichiers lot unique récupérés", {
      documentId,
      count: files.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    return res.json(files);
  } catch (error) {
    logger.error("❌ getLotUniqueFiles:", {
      documentId,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    return res.status(500).json({ message: "Erreur récupération lot unique" });
  }
};

/**
 * Supprimer un fichier uploadé
 * DELETE /api/documents/:documentId/files/:fileId
 */
exports.deleteDocumentFile = async (req, res) => {
  const startTime = Date.now();
  const { documentId, fileId } = req.params;

  try {
    logger.info(
      "🗑️ Tentative de suppression d'un fichier dans document_fichier",
      {
        documentId,
        fileId,
        userId: req.user?.id,
      },
    );

    // 1. Vérifier que le fichier existe
    const file = await DocumentFichier.findOne({
      where: {
        id: fileId,
        document_id: documentId,
      },
    });

    if (!file) {
      logger.warn("⚠️ Fichier non trouvé", {
        documentId,
        fileId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Fichier non trouvé" });
    }

    // 2. Récupérer le chemin complet du fichier
    const filePath = path.join(process.cwd(), file.fichier);

    // 3. Supprimer le fichier du système de fichiers
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info("📁 Fichier physique supprimé", {
          filePath,
          userId: req.user?.id,
        });
      } else {
        logger.warn("⚠️ Fichier physique non trouvé", {
          filePath,
          userId: req.user?.id,
        });
      }
    } catch (unlinkError) {
      logger.error("❌ Erreur lors de la suppression du fichier physique", {
        filePath,
        error: unlinkError.message,
        userId: req.user?.id,
      });
      // On continue même si la suppression physique échoue
    }

    // 4. Supprimer l'enregistrement en base de données
    await file.destroy();

    logger.info("✅ Fichier supprimé avec succès", {
      documentId,
      fileId,
      originalName: file.original_name,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // 5. Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "delete",
      resource: "document_fichier",
      resource_id: fileId,
      resource_identifier: file.original_name,
      description: `Suppression du fichier "${file.original_name}" du document #${documentId}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        documentId,
        fileId,
        originalName: file.original_name,
        filePath: file.fichier,
        duration: Date.now() - startTime,
      },
    });

    res.json({
      success: true,
      message: "Fichier supprimé avec succès",
      deletedFile: {
        id: file.id,
        original_name: file.original_name,
      },
    });
  } catch (error) {
    logger.error("❌ Erreur lors de la suppression du fichier:", {
      documentId,
      fileId,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur lors de la suppression du fichier",
      error: error.message,
    });
  }
};

/**
 * Supprimer un fichier de pièce (PiecesFichier)
 * DELETE /api/documents/:documentId/pieces/:pieceId/files/:fileId
 */
exports.deletePieceFile = async (req, res) => {
  const startTime = Date.now();
  const { documentId, pieceId, fileId } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un fichier de pièce", {
      documentId,
      pieceId,
      fileId,
      userId: req.user?.id,
    });

    // 1. Vérifier que le fichier existe
    const file = await PiecesFichier.findOne({
      where: {
        id: fileId,
        document_id: documentId,
        piece_id: pieceId,
      },
    });

    if (!file) {
      logger.warn("⚠️ Fichier de pièce non trouvé", {
        documentId,
        pieceId,
        fileId,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Fichier non trouvé" });
    }

    // 2. Récupérer le chemin complet du fichier
    const filePath = path.join(process.cwd(), file.fichier);

    // 3. Supprimer le fichier du système de fichiers
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info("📁 Fichier physique de pièce supprimé", {
          filePath,
          userId: req.user?.id,
        });
      }
    } catch (unlinkError) {
      logger.error("❌ Erreur suppression fichier physique pièce", {
        filePath,
        error: unlinkError.message,
      });
    }

    // 4. Supprimer l'enregistrement
    await file.destroy();

    logger.info("✅ Fichier de pièce supprimé avec succès", {
      documentId,
      pieceId,
      fileId,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "delete",
      resource: "pieces_fichier",
      resource_id: fileId,
      resource_identifier: file.original_name,
      description: `Suppression du fichier de pièce "${file.original_name}"`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Fichier supprimé avec succès",
    });
  } catch (error) {
    logger.error("❌ Erreur suppression fichier de pièce:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
};
