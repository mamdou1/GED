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
  Agent,
  EntityCustomField,
  EntityCustomFieldValue,
  DocumentEntity,
} = require("../models");
const buildAccessWhere = require("../utils/buildAccessWhere.utils");
const path = require("path");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const fs = require("fs");

// ==================== CREATE ====================
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  const startTime = Date.now();

  try {
    const { type_document_id, values, piece_values, entities } = req.body;

    const currentUser = req.user.id;
    const currentUserData = await Agent.findByPk(currentUser);

    if (!type_document_id) {
      return res.status(400).json({
        message: "Le type de document est requis",
      });
    }

    logger.info("📄 Tentative de création d'un document", {
      userId: currentUser,
      type_document_id,
      values,
    });

    console.log("🔍 values reçues:", values);
    console.log("🔍 type de values:", typeof values);
    console.log("🔍 clés:", values ? Object.keys(values) : []);
    console.log("🔍 nom:", currentUserData?.nom);
    console.log("🔍 prénom:", currentUserData?.prenom);

    // 1. Créer le document
    const doc = await Document.create({ type_document_id }, { transaction: t });

    // 2. LIAISON DOCUMENT → ENTITÉS (corrigé)
    if (entities && Array.isArray(entities) && entities.length > 0) {
      const entityRows = entities.map((entity) => ({
        document_id: doc.id,
        entity_type: entity.entity_type,
        entity_id: entity.entity_id,
      }));

      await DocumentEntity.bulkCreate(entityRows, { transaction: t });
    }

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
      const metaRows = Object.entries(values).map(([meta_field_id, value]) => ({
        document_id: doc.id,
        meta_field_id: parseInt(meta_field_id),
        value: value?.toString() || "",
      }));

      await DocumentValue.bulkCreate(metaRows, { transaction: t });
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
                value: value.toString(),
              });
            }
          }
        }
      }

      if (pieceValueRows.length > 0) {
        await PieceValue.bulkCreate(pieceValueRows, { transaction: t });
      }
    }

    // Commit transaction
    await t.commit();

    logger.info("✅ Document créé avec succès", {
      documentId: doc.id,
      type_document_id,
      userId: currentUser,
      duration: Date.now() - startTime,
    });

    // Historique
    await HistoriqueService.logCreate(req, "document", doc);

    return res.status(201).json({
      message: "Document créé avec succès",
      id: doc.id,
      type_document_id: doc.type_document_id,
    });
  } catch (e) {
    if (t) await t.rollback();

    console.error("❌ Erreur create document:", e);

    return res.status(500).json({
      message: e.message,
    });
  }
};

// ==================== GET ALL ====================
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
          as: "entities", // ← Vérifiez que cet alias correspond au modèle
          required: false, // ← AJOUTEZ CECI pour ne pas exclure les docs sans entité
          where: undefined, // ← Pas de filtre par défaut
        },
        {
          model: Pieces,
          as: "pieces",
          attributes: ["id", "libelle", "code_pieces"],
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
          ],
        },
        {
          model: EntityCustomFieldValue,
          as: "customFieldValues",
          include: [{ model: EntityCustomField, as: "customField" }],
        },
      ],
    });

    logger.info("✅ Documents récupérés", {
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour les GET avec sidebar
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

// ==================== GET BY ID ====================
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
            { model: DocumentFile, as: "file" },
          ],
        },
        {
          model: EntityCustomFieldValue,
          as: "customFieldValues",
          include: [{ model: EntityCustomField, as: "customField" }],
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

// ==================== UPDATE ====================
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
        { model: EntityCustomFieldValue, as: "customFieldValues" },
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

    if (values && typeof values === "object") {
      // Mise à jour des champs de base
      for (const [metaFieldId, value] of Object.entries(values)) {
        const existingValue = await DocumentValue.findOne({
          where: {
            document_id: id,
            meta_field_id: metaFieldId,
          },
        });

        if (existingValue) {
          await existingValue.update({ value: String(value) });
        } else {
          await DocumentValue.create({
            document_id: id,
            meta_field_id: metaFieldId,
            value: String(value),
          });
        }
      }
    }

    const updatedDoc = await Document.findByPk(id, {
      include: [
        { model: DocumentValue, as: "values" },
        { model: EntityCustomFieldValue, as: "customFieldValues" },
      ],
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

// ==================== REMOVE ====================
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

    await Document.destroy({ where: { id } });

    logger.info("✅ Document supprimé avec succès", {
      documentId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

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

// ==================== UPLOAD DOCUMENT FILES ====================
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

    res.json({
      message: "Fichiers ajoutés avec succès",
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (err) {
    await t.rollback();
    logger.error("❌ Erreur upload:", err);
    res.status(500).json({
      message: "Erreur lors de l'upload",
      error: err.message,
    });
  }
};

// ==================== UPLOAD PIECE FILE ====================
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

    res.json({
      message: "Fichier(s) uploadé(s) avec succès",
      files: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (err) {
    await t.rollback();
    logger.error("❌ Erreur uploadPieceFile:", err);
    res.status(500).json({
      message: "Erreur lors de l'upload du fichier",
      error: err.message,
    });
  }
};

// ==================== UPLOAD LOT UNIQUE ====================
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
    logger.error("❌ Erreur upload lot avec pièces:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==================== UPDATE DISPONIBILITE ====================
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

    doc.disponible = disponible;
    await doc.save();

    logger.info("✅ Disponibilité mise à jour", {
      documentId,
      pieceId,
      disponible: doc.disponible,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    return res.json({
      message: "Disponibilité mise à jour",
      disponible: doc.disponible,
    });
  } catch (error) {
    logger.error("❌ Erreur update disponibilité:", error);
    return res.status(500).json({ message: "Erreur update disponibilité" });
  }
};

// ==================== GET DOCUMENT FILES ====================
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
    logger.error("❌ getPieceFiles error:", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des fichiers",
    });
  }
};

// ==================== GET DOCUMENT PIECES ====================
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
    logger.error("🔥 getDocumentPieces error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ==================== GET LOT UNIQUE FILES ====================
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
    logger.error("❌ getLotUniqueFiles:", error);
    return res.status(500).json({ message: "Erreur récupération lot unique" });
  }
};

// ==================== DELETE DOCUMENT FILE ====================
exports.deleteDocumentFile = async (req, res) => {
  const startTime = Date.now();
  const { documentId, fileId } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un fichier", {
      documentId,
      fileId,
      userId: req.user?.id,
    });

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

    const filePath = path.join(process.cwd(), file.fichier);

    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info("📁 Fichier physique supprimé", {
          filePath,
          userId: req.user?.id,
        });
      }
    } catch (unlinkError) {
      logger.error("❌ Erreur suppression fichier physique", {
        filePath,
        error: unlinkError.message,
      });
    }

    await file.destroy();

    logger.info("✅ Fichier supprimé avec succès", {
      documentId,
      fileId,
      originalName: file.original_name,
      userId: req.user?.id,
      duration: Date.now() - startTime,
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
    logger.error("❌ Erreur lors de la suppression du fichier:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression du fichier",
      error: error.message,
    });
  }
};

// ==================== DELETE PIECE FILE ====================
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

    const filePath = path.join(process.cwd(), file.fichier);

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

    await file.destroy();

    logger.info("✅ Fichier de pièce supprimé avec succès", {
      documentId,
      pieceId,
      fileId,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({
      success: true,
      message: "Fichier supprimé avec succès",
    });
  } catch (error) {
    logger.error("❌ Erreur suppression fichier de pièce:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
};
