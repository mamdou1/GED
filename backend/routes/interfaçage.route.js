const express = require("express");
const router = express.Router();
const multer = require("multer");
const interfaçageController = require("../controllers/interfaçage.controller");

// Configuration Multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/temp/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo max
});

// ====================== LES 3 APIs ======================

// API 1 : Création Document + Métadonnées principales
router.post("/documents", interfaçageController.createDocument);

// API 2 : Ajout des Pièces + Métadonnées des pièces
router.post("/documents/:document_id/pieces", interfaçageController.addPieces);

// API 3 : Upload des Fichiers (INDIVIDUEL ou LOT_UNIQUE)
router.post(
  "/documents/:document_id/files",
  upload.array("files"),
  interfaçageController.uploadFiles,
);

module.exports = router;
