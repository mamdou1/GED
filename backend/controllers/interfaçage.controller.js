const {
  Document,
  DocumentValue,
  DocumentPiece,
  PieceValue,
  DocumentFichier,
  DocumentEntity,
} = require("../models");

const sequelize = require("../config/database");

// ====================== API 1 ======================
exports.createDocument = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      type_document_id,
      entite,
      metadonnees,
      source,
      created_by,
      reference_externe,
    } = req.body;

    const document = await Document.create(
      {
        type_document_id,
      },
      { transaction },
    );

    // Liaison avec l'entité
    if (entite) {
      await DocumentEntity.create(
        {
          document_id: document.id,
          entity_type: entite.type.toLowerCase(),
          entity_id: entite.id,
        },
        { transaction },
      );
    }

    // Métadonnées du document
    if (metadonnees && metadonnees.length > 0) {
      const values = metadonnees.map((m) => ({
        document_id: document.id,
        meta_field_id: m.meta_field_id,
        value: m.value?.toString() || null,
      }));
      await DocumentValue.bulkCreate(values, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Document créé avec succès",
      document_id: document.id,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== API 2 ======================
exports.addPieces = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { document_id } = req.params;
    const { pieces } = req.body;

    if (!pieces || pieces.length === 0) {
      throw new Error("Aucune pièce envoyée");
    }

    for (const piece of pieces) {
      // Liaison document - piece
      await DocumentPiece.create(
        {
          document_id,
          piece_id: piece.piece_id,
          disponible: !!piece.disponible,
        },
        { transaction },
      );

      // Métadonnées des pièces
      if (piece.metadonnees_piece && piece.metadonnees_piece.length > 0) {
        const values = piece.metadonnees_piece.map((m) => ({
          document_id,
          piece_id: piece.piece_id,
          piece_meta_field_id: m.piece_meta_field_id,
          value: m.value?.toString() || null,
        }));
        await PieceValue.bulkCreate(values, { transaction });
      }
    }

    await transaction.commit();
    res.json({
      success: true,
      message: "Pièces ajoutées avec succès",
      document_id,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== API 3 ======================
exports.uploadFiles = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { document_id } = req.params;
    const { mode } = req.body; // INDIVIDUEL ou LOT_UNIQUE
    const files = req.files || [];
    const piece_id = req.body.piece_id; // Obligatoire si mode INDIVIDUEL

    if (files.length === 0) {
      throw new Error("Aucun fichier envoyé");
    }

    for (const file of files) {
      await DocumentFichier.create(
        {
          document_id,
          piece_id: mode === "LOT_UNIQUE" ? null : piece_id,
          fichier: file.path,
          original_name: file.originalname,
          new_file_name: file.filename,
          mode: mode || "INDIVIDUEL",
        },
        { transaction },
      );
    }

    await transaction.commit();

    res.json({
      success: true,
      message: "Fichiers uploadés avec succès",
      document_id,
      files_count: files.length,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};
