const router = require("express").Router();
const ctrl = require("../controllers/document.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const upload = require("../middlewares/ulpoadDocument.middleware");
const historiqueMiddleware = require("../middlewares/historiqueLogger.middleware");

// =============================================
// 1. ROUTES SPÉCIFIQUES (avec mots-clés) - EN PREMIER !
// =============================================

// ✅ LOT UNIQUE - GET (TRÈS SPÉCIFIQUE)
router.get(
  "/:documentId/lot-unique/files",
  verifyToken,
  authorizePermission("document", "read"),
  ctrl.getLotUniqueFiles,
);

// ✅ LOT UNIQUE - POST
router.post(
  "/:documentId/document-type/:documentTypeId/lot-unique/files",
  verifyToken,
  authorizePermission("document", "create"),
  upload.array("files", 10),
  ctrl.uploadDocumentFiles,
);

router.post(
  "/:documentId/document-type/:documentTypeId/lot-unique/files-with-pieces",
  verifyToken,
  authorizePermission("document", "update"),
  upload.array("files", 10),
  ctrl.uploadLotUniqueWithPieces,
);

// ✅ PIÈCE INDIVIDUELLE - POST
router.post(
  "/:documentId/document-type/:documentTypeId/piece/:pieceId/files",
  verifyToken,
  authorizePermission("document", "create"),
  upload.array("files", 10),
  ctrl.uploadDocumentFiles,
);

// ✅ PIÈCE INDIVIDUELLE - GET
router.get(
  "/:documentId/piece/:pieceId/files",
  verifyToken,
  authorizePermission("document", "read"),
  ctrl.getDocumentFiles,
);

router.post(
  "/:documentId/pieces/:pieceId/upload-file",
  verifyToken,
  authorizePermission("document", "create"),
  upload.array("files", 10),
  ctrl.uploadPieceFile,
);

// ✅ DISPONIBILITÉ PIÈCE
router.patch(
  "/:documentId/pieces/:pieceId/disponible",
  verifyToken,
  authorizePermission("document", "update"),
  ctrl.updateDocumentPieceDisponibilite,
);

// ✅ LISTE DES PIÈCES D'UN DOCUMENT
router.get(
  "/:documentId/pieces",
  verifyToken,
  authorizePermission("document", "read"),
  ctrl.getDocumentPieces,
);

// Supprimer un fichier de document
router.delete(
  "/:documentId/files/:fileId",
  verifyToken,
  authorizePermission("document", "delete"),
  ctrl.deleteDocumentFile,
);

// Supprimer un fichier de pièce
router.delete(
  "/:documentId/pieces/:pieceId/files/:fileId",
  verifyToken,
  authorizePermission("document", "delete"),
  ctrl.deletePieceFile,
);

// =============================================
// 2. ROUTES GÉNÉRIQUES (AVEC /:id) - EN DERNIER !
// =============================================

// ✅ CRUD - À METTRE ABSOLUMENT APRÈS les routes spécifiques
router.get(
  "/:id",
  verifyToken,
  authorizePermission("document", "read"),
  ctrl.getById,
);

router.put(
  "/:id",
  verifyToken,
  authorizePermission("document", "update"),
  ctrl.update,
);

router.delete(
  "/:id",
  verifyToken,
  authorizePermission("document", "delete"),
  ctrl.remove,
);

router.post(
  "/",
  verifyToken,
  authorizePermission("document", "create"),
  ctrl.create,
);

router.get(
  "/",
  verifyToken,
  authorizePermission("document", "read"),
  ctrl.getAll,
);

module.exports = router;
