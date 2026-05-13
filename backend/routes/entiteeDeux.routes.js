const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const entiteeDeuxController = require("../controllers/entiteeDeux.controller");

router.post(
  "/",
  verifyToken,
  authorizePermission("entiteeDeux", "create"),
  entiteeDeuxController.createEntiteeDeux,
);

router.get(
  "/",
  verifyToken,
  authorizePermission("entiteeDeux", "read"),
  entiteeDeuxController.getAllEntiteeDeux,
);
router.delete(
  "/titre",
  verifyToken,
  authorizePermission("entiteeDeux", "delete"),
  entiteeDeuxController.deleteTitre,
);
router.get(
  "/by-entiteeUn/:entiteeUnId",
  verifyToken,
  authorizePermission("entiteeDeux", "read"),
  entiteeDeuxController.getEntiteeDeuxByEntiteeUn,
);

// ✅ DÉPLACER ICI
router.get(
  "/titre",
  verifyToken,
  authorizePermission("entiteeDeux", "read"),
  entiteeDeuxController.getEntiteeDeuxTitre,
);
// router.post(
//   "/titre",
//   verifyToken,
//   authorizePermission("section", "create"),
//   entiteeDeuxController.createEntiteeDeuxTitre,
// );
router.put(
  "/titre",
  verifyToken,
  authorizePermission("entiteeDeux", "update"),
  entiteeDeuxController.updateEntiteeDeuxTitre,
);

// ❌ APRÈS
router.get(
  "/:id/fonctions",
  verifyToken,
  authorizePermission("entiteeDeux", "read"),
  entiteeDeuxController.getFunctionsByEntiteeDeux,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("entiteeDeux", "update"),
  entiteeDeuxController.updateEntiteeDeux,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("entiteeDeux", "delete"),
  entiteeDeuxController.deleteEntiteeDeux,
);

router.get(
  "/:id/types",
  verifyToken,
  authorizePermission("entiteeDeux", "read"),
  entiteeDeuxController.getTypesOfEntiteeDeux,
);

// Ajouter des types de documents à une direction
router.post(
  "/:id/types",
  verifyToken,
  authorizePermission("entiteeDeux", "update"),
  entiteeDeuxController.addTypesToEntiteeDeux,
);

// Retirer des types de documents d'une direction
router.delete(
  "/:id/types",
  verifyToken,
  authorizePermission("entiteeDeux", "update"),
  entiteeDeuxController.removeTypesFromEntiteeDeux,
);

module.exports = router;
