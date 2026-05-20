// backend/routes/courrierFile.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // Utilisation de votre middleware existant
const controller = require("../controllers/courrierFile.controller");

// Routes pour les fichiers des courriers
router.post(
  "/courrier/:courrierId/files", // URL: /courrier-files/courrier/123/files
  upload.array("files", 10),
  controller.uploadCourrierFiles,
);

router.get("/courrier/:courrierId/files", controller.getCourrierFiles);

router.delete(
  "/courrier/:courrierId/file/:fileId",
  controller.deleteCourrierFile,
);

router.get("/courrier/file/:fileId/download", controller.downloadCourrierFile);

module.exports = router;
