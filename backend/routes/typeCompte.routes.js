// backend/routes/typeCompte.routes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const typeCompteController = require("../controllers/typeCompte.controller");

// Toutes les routes nécessitent un token valide
router.use(verifyToken);

// Routes CRUD
router.get(
  "/",
  authorizePermission("typeCompte", "read"),
  typeCompteController.getAll,
);

router.get(
  "/:id",
  authorizePermission("typeCompte", "read"),
  typeCompteController.getById,
);

router.post(
  "/",
  authorizePermission("typeCompte", "create"),
  typeCompteController.create,
);

router.put(
  "/:id",
  authorizePermission("typeCompte", "update"),
  typeCompteController.update,
);

router.delete(
  "/:id",
  authorizePermission("typeCompte", "delete"),
  typeCompteController.remove,
);

module.exports = router;
