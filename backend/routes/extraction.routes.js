// backend/routes/extraction.routes.js
const express = require("express");
const router = express.Router();
const { suggestForPiece } = require("../controllers/extraction.controller");

/**
 * @swagger
 * /api/extraction/pieces/{pieceId}/suggest:
 *   post:
 *     summary: Suggère des valeurs de champs à partir d'un texte OCR
 *     tags: [Extraction]
 */
router.post("/pieces/:pieceId/suggest", suggestForPiece);

module.exports = router;
