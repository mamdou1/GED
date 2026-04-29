const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const destinataireExterneController = require("../controllers/destinataireExterne.controller");

router.post(
  "/",
  verifyToken,
  authorizePermission("destinataire_externe", "create"),
  destinataireExterneController.create
);

router.get(
  "/",
  verifyToken,
  authorizePermission("destinataire_externe", "read"),
  destinataireExterneController.getAll
);

router.get(
  "/:id",
  verifyToken,
  authorizePermission("destinataire_externe", "read"),
  destinataireExterneController.getById
);

router.put(
  "/:id",
  verifyToken,
  authorizePermission("destinataire_externe", "update"),
  destinataireExterneController.update
);

router.delete(
  "/:id",
  verifyToken,
  authorizePermission("destinataire_externe", "delete"),
  destinataireExterneController.delete
);

module.exports = router;