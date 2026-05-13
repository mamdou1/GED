const router = require("express").Router();
const ctrl = require("../controllers/typeDocument.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("documentType", "create"),
  ctrl.create,
);
router.get(
  "/",
  verifyToken,
  //authorizePermission("documentType", "read"),
  ctrl.getAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("documentType", "read"),
  ctrl.getById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("documentType", "update"),
  ctrl.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("documentType", "delete"),
  ctrl.remove,
);
router.post(
  "/:id/pieces",
  verifyToken,
  authorizePermission("documentType", "create"),
  //authorizeRoles("ADMIN", "MEMBRE", "MEMBRE_AUTHORIZE"),
  ctrl.addPiecesToTypeDocument,
);

router.get(
  "/:id/pieces",
  verifyToken,
  authorizePermission("documentType", "read"),
  ctrl.getPiecesOfTypeDocument,
);

router.delete(
  "/:id/pieces",
  verifyToken,
  authorizePermission("documentType", "delete"),
  ctrl.removePieceFromTypeDocument,
);

router.post(
  "/:typeDocumentId/entity-pieces/add",
  verifyToken,
  authorizePermission("documentType", "update"),
  ctrl.addPieceToEntityTypeDocument,
);

router.get(
  "/:typeDocumentId/entity-pieces/:entityType/:entityId",
  verifyToken,
  authorizePermission("documentType", "read"),
  ctrl.getEffectivePiecesForEntity,
);

// Retirer une pièce pour une entité
router.post(
  "/:typeDocumentId/entity-pieces/remove",
  verifyToken,
  authorizePermission("documentType", "update"),
  ctrl.removePieceFromEntityTypeDocument,
);

module.exports = router;
