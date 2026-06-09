// backend/controllers/extraction.controller.js
const { PieceMetaField } = require("../models");
const { suggestFields } = require("../services/extractionMatcher");

// POST /api/extraction/pieces/:pieceId/suggest  body { ocrText }
exports.suggestForPiece = async (req, res) => {
  try {
    const { pieceId } = req.params;
    const { ocrText } = req.body;

    if (!ocrText || typeof ocrText !== "string") {
      return res.status(400).json({ error: "ocrText (string) requis" });
    }

    const fields = await PieceMetaField.findAll({
      where: { piece_id: pieceId },
      order: [["position", "ASC"]],
    });

    const mapped = fields.map((f) => ({
      id: f.id,
      label: f.label,
      field_type: f.field_type,
      extraction_keywords: f.extraction_keywords,
      extraction_pattern: f.extraction_pattern,
    }));

    const suggestions = suggestFields(ocrText, mapped);
    return res.json({ suggestions });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
