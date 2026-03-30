const { PiecesFichier } = require("../models");
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger.config");

async function deletePieceFileRecord(fileId, documentId, pieceId) {
  const file = await PiecesFichier.findOne({
    where: {
      id: fileId,
      document_id: documentId,
      piece_id: pieceId,
    },
  });

  if (!file) return null;

  const filePath = path.join(process.cwd(), file.fichier);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    logger.error("Erreur suppression fichier physique", {
      filePath,
      error: err.message,
    });
  }

  await file.destroy();
  return file;
}

module.exports = { deletePieceFileRecord };
