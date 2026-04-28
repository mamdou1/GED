const router = require("express").Router();
const ctrl = require("../controllers/box.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("box", "create"),
  ctrl.create,
);
router.get(
  "/",
  verifyToken,
  //authorizePermission("box", "read"),
  ctrl.findAll,
);
router.get(
  "/:id",
  verifyToken,
  authorizePermission("box", "read"),
  ctrl.findById,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("box", "update"),
  ctrl.update,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("box", "delete"),
  ctrl.delete,
);

router.get(
  "/:id/document",
  verifyToken,
  authorizePermission("box", "read"),
  ctrl.getAllDocumentByBox,
);
router.post(
  "/:boxId/add/:documentId",
  verifyToken,
  authorizePermission("box", "create"),
  ctrl.addDocumentToBox,
);
router.post(
  "/:boxId/remove/:documentId",
  verifyToken,
  authorizePermission("box", "create"),
  ctrl.retireDocumentToBox,
);

router.post(
  "/:sourceBoxId/move/:documentId",
  verifyToken,
  authorizePermission("box", "create"),
  ctrl.moveDocumentToBox,
);

module.exports = router;
