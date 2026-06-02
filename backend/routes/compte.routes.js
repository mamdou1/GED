// backend/routes/compte.routes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const compteController = require("../controllers/compte.controller");

router.use(verifyToken);

router.get(
  "/client/:clientId",
  authorizePermission("compte", "read"),
  compteController.getByClient,
);
router.get(
  "/:id/type-documents",
  authorizePermission("compte", "read"),
  compteController.getTypeDocumentsByCompte,
);
router.get(
  "/:id",
  authorizePermission("compte", "read"),
  compteController.getById,
);

router.put(
  "/:id",
  authorizePermission("compte", "update"),
  compteController.update,
);

router.delete(
  "/:id",
  authorizePermission("compte", "delete"),
  compteController.remove,
);

router.post(
  "/",
  authorizePermission("compte", "create"),
  compteController.create,
);

router.get("/", authorizePermission("compte", "read"), compteController.getAll);

module.exports = router;
