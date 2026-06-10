// backend/routes/extraction.routes.js
const express = require("express");
const router = express.Router();
const { suggestForPiece } = require("../controllers/extraction.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

/**
 * @swagger
 * /api/extraction/pieces/{pieceId}/suggest:
 *   post:
 *     summary: Suggère des valeurs de champs à partir d'un texte OCR
 *     tags: [Extraction]
 */
router.post(
  "/pieces/:pieceId/suggest",
  verifyToken,
  authorizePermission("document", "read"),
  suggestForPiece,
);

module.exports = router;
