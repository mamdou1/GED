// controllers/pieceValue.controller.js
const { PieceValue, PieceMetaField, PiecesFichier } = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const { deletePieceFileRecord } = require("../utils/PieceFileDelete.utils");
const { deletePieceFile } = require("./document.controller");

// Récupérer toutes les valeurs pour un document
exports.getPieceValuesByDocument = async (req, res) => {
  const startTime = Date.now();
  const { documentId } = req.params;

  try {
    logger.debug("🔍 Récupération des valeurs de pièces pour document", {
      documentId,
      userId: req.user?.id,
    });

    const values = await PieceValue.findAll({
      where: { document_id: documentId },
      include: [
        {
          model: PieceMetaField,
          as: "piece_metaField",
          attributes: ["id", "label", "name", "field_type", "required"],
        },
        {
          model: PiecesFichier,
          as: "file",
          attributes: ["id", "fichier", "original_name"],
        },
      ],
    });

    logger.info("✅ Valeurs de pièces récupérées", {
      documentId,
      count: values.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(values);
  } catch (error) {
    logger.error("❌ Erreur getPieceValuesByDocument:", {
      documentId,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les valeurs pour une pièce spécifique
exports.getPieceValuesByPiece = async (req, res) => {
  const startTime = Date.now();
  const { documentId, pieceId } = req.params;

  try {
    logger.debug("🔍 Récupération des valeurs pour une pièce spécifique", {
      documentId,
      pieceId,
      userId: req.user?.id,
    });

    const values = await PieceValue.findAll({
      where: {
        document_id: documentId,
        piece_id: pieceId,
      },
      include: [
        {
          model: PieceMetaField,
          as: "piece_metaField",
          attributes: ["id", "label", "name", "field_type", "required"],
        },
        {
          model: PiecesFichier,
          as: "file",
          attributes: ["id", "fichier", "original_name"],
        },
      ],
    });

    logger.info("✅ Valeurs de la pièce récupérées", {
      documentId,
      pieceId,
      count: values.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(values);
  } catch (error) {
    logger.error("❌ Erreur getPieceValuesByPiece:", {
      documentId,
      pieceId,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

// Créer une nouvelle valeur
exports.createPieceValue = async (req, res) => {
  const startTime = Date.now();
  const { documentId } = req.params;

  try {
    const { piece_id, piece_meta_field_id, value, row_id } = req.body;

    logger.info("📝 Tentative de création d'une valeur de pièce", {
      documentId,
      piece_id,
      piece_meta_field_id,
      row_id,
      userId: req.user?.id,
    });

    const pieceValue = await PieceValue.create({
      document_id: parseInt(documentId),
      piece_id: parseInt(piece_id),
      piece_meta_field_id: parseInt(piece_meta_field_id),
      value: value || null,
      row_id: row_id || null,
    });

    logger.info("✅ Valeur de pièce créée avec succès", {
      valueId: pieceValue.id,
      documentId,
      piece_id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "pieceValue", pieceValue);

    res.status(201).json(pieceValue);
  } catch (error) {
    logger.error("❌ Erreur createPieceValue:", {
      documentId,
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une valeur
exports.updatePieceValue = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'une valeur de pièce", {
      valueId: id,
      userId: req.user?.id,
      body: req.body,
    });

    const oldValue = await PieceValue.findByPk(id);
    if (!oldValue) {
      logger.warn("⚠️ Valeur non trouvée", {
        valueId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Valeur non trouvée" });
    }

    const oldCopy = oldValue.toJSON();
    const { value } = req.body;

    await oldValue.update({ value });

    const updatedValue = await PieceValue.findByPk(id);

    logger.info("✅ Valeur de pièce mise à jour avec succès", {
      valueId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "pieceValue", oldCopy, updatedValue);

    res.json(updatedValue);
  } catch (error) {
    logger.error("❌ Erreur updatePieceValue:", {
      valueId: id,
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

exports.deletePieceValue = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'une valeur de pièce", {
      valueId: id,
      userId: req.user?.id,
    });

    const value = await PieceValue.findByPk(id);
    if (!value) {
      logger.warn("⚠️ Valeur non trouvée pour suppression", {
        valueId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Valeur non trouvée" });
    }

    await PieceValue.destroy({ where: { id } });

    logger.info("✅ Valeur de pièce supprimée avec succès", {
      valueId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "pieceValue", value);

    res.json({ success: true });
  } catch (error) {
    logger.error("❌ Erreur deletePieceValue:", {
      valueId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une valeur
// exports.deletePieceValue = async (req, res) => {
//   const startTime = Date.now();
//   const { id } = req.params;

//   try {
//     logger.info("🗑️ Tentative de suppression d'une valeur de pièce", {
//       valueId: id,
//       userId: req.user?.id,
//     });

//     // 🔥 Récupérer la valeur AVEC ses fichiers associés
//     const value = await PieceValue.findByPk(id, {
//       include: [
//         {
//           model: PiecesFichier,
//           as: "file",
//           attributes: ["id", "fichier", "original_name"],
//         },
//       ],
//     });

//     if (!value) {
//       logger.warn("⚠️ Valeur non trouvée pour suppression", {
//         valueId: id,
//         userId: req.user?.id,
//       });
//       return res.status(404).json({ message: "Valeur non trouvée" });
//     }

//     // 🔥 Récupérer les fichiers associés
//     const files = value.file || [];

//     // Supprimer les fichiers physiques et en base
//     for (const file of files) {
//       try {
//         await deletePieceFileRecord(file.id, value.document_id, value.piece_id);
//         logger.info("📁 Fichier associé supprimé", {
//           fileId: file.id,
//           fileName: file.original_name,
//         });
//       } catch (error) {
//         logger.error("Erreur suppression fichier associé", {
//           fileId: file.id,
//           error: error.message,
//         });
//         // On continue même si la suppression d'un fichier échoue
//       }
//     }

//     // Supprimer la valeur en base de données
//     await value.destroy();

//     logger.info("✅ Valeur de pièce supprimée avec succès", {
//       valueId: id,
//       filesDeleted: files.length,
//       userId: req.user?.id,
//       duration: Date.now() - startTime,
//     });

//     // Journalisation dans l'historique
//     await HistoriqueService.logDelete(req, "pieceValue", value);

//     res.json({
//       success: true,
//       message: "Valeur et fichiers associés supprimés avec succès",
//       filesDeleted: files.length,
//     });
//   } catch (error) {
//     logger.error("❌ Erreur deletePieceValue:", {
//       valueId: id,
//       error: error.message,
//       stack: error.stack,
//       userId: req.user?.id,
//       duration: Date.now() - startTime,
//     });
//     res.status(500).json({
//       message: "Erreur lors de la suppression",
//       error: error.message,
//     });
//   }
// };

// exports.deletePieceValue = async (req, res) => {
//   const startTime = Date.now();
//   const { id } = req.params;

//   try {
//     logger.info("🗑️ Tentative de suppression d'une valeur de pièce", {
//       valueId: id,
//       userId: req.user?.id,
//     });

//     // 1. Récupérer la valeur avec ses fichiers associés
//     const value = await PieceValue.findByPk(id, {
//       include: [
//         {
//           model: PiecesFichier,
//           as: "file",
//           attributes: ["id", "fichier", "original_name"],
//         },
//       ],
//     });

//     if (!value) {
//       logger.warn("⚠️ Valeur non trouvée pour suppression", {
//         valueId: id,
//         userId: req.user?.id,
//       });
//       return res.status(404).json({ message: "Valeur non trouvée" });
//     }

//     // 2. Supprimer les fichiers associés (PiecesFichier)
//     const files = value.file || [];
//     for (const file of files) {
//       try {
//         // Appeler la fonction deletePieceFile du document.controller
//         // Créer un faux objet req et res pour l'appel
//         const mockReq = {
//           params: {
//             documentId: value.document_id,
//             pieceId: value.piece_id,
//             fileId: file.id,
//           },
//           user: req.user,
//           ip: req.ip,
//           headers: req.headers,
//           method: "DELETE",
//           originalUrl: req.originalUrl,
//         };

//         const mockRes = {
//           status: (code) => ({
//             json: (data) => {
//               if (code !== 200) {
//                 logger.error("❌ Erreur suppression fichier associé", {
//                   fileId: file.id,
//                   status: code,
//                   data,
//                 });
//               }
//               return { status: code, json: data };
//             },
//           }),
//           json: (data) => data,
//         };

//         await deletePieceFile(mockReq, mockRes);
//         logger.info("📁 Fichier associé supprimé", {
//           fileId: file.id,
//           fileName: file.original_name,
//         });
//       } catch (fileError) {
//         logger.error("❌ Erreur lors de la suppression du fichier associé", {
//           fileId: file.id,
//           error: fileError.message,
//           userId: req.user?.id,
//         });
//         // On continue même si la suppression du fichier échoue
//       }
//     }

//     // 3. Supprimer la valeur en base de données
//     await value.destroy();

//     logger.info("✅ Valeur de pièce supprimée avec succès", {
//       valueId: id,
//       filesDeleted: files.length,
//       userId: req.user?.id,
//       duration: Date.now() - startTime,
//     });

//     // Journalisation dans l'historique
//     await HistoriqueService.logDelete(req, "pieceValue", value);

//     res.json({
//       success: true,
//       message: "Valeur et fichiers associés supprimés avec succès",
//       filesDeleted: files.length,
//     });
//   } catch (error) {
//     logger.error("❌ Erreur deletePieceValue:", {
//       valueId: id,
//       error: error.message,
//       stack: error.stack,
//       userId: req.user?.id,
//       duration: Date.now() - startTime,
//     });
//     res.status(500).json({
//       message: "Erreur lors de la suppression",
//       error: error.message,
//     });
//   }
// };
