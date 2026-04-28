const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const expediteurController = require("../controllers/expediteur.controller");

router.post(
  "/",
  verifyToken,
  authorizePermission("expediteur", "create"),
  expediteurController.create
);

router.get(
  "/",
  verifyToken,
  authorizePermission("expediteur", "read"),
  expediteurController.getAll
);

router.get(
  "/:id",
  verifyToken,
  authorizePermission("expediteur", "read"),
  expediteurController.getById
);

router.put(
  "/:id",
  verifyToken,
  authorizePermission("expediteur", "update"),
  expediteurController.update
);

router.delete(
  "/:id",
  verifyToken,
  authorizePermission("expediteur", "delete"),
  expediteurController.delete
);

module.exports = router;