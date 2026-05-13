const express = require("express");
const router = express.Router();
const entiteeUnController = require("../controllers/entiteeUn.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("entiteeUn", "create"),
  entiteeUnController.createEntiteeUn,
);
router.get(
  "/",
  verifyToken,
  authorizePermission("entiteeUn", "read"),
  entiteeUnController.getAllEntiteeUn,
);

router.delete(
  "/titre",
  verifyToken,
  authorizePermission("entiteeUn", "delete"),
  entiteeUnController.deleteTitre,
);

// ✅ DÉPLACER ICI (Avant les routes avec :id)
router.get(
  "/titre",
  verifyToken,
  authorizePermission("entiteeUn", "read"),
  entiteeUnController.getEntiteeUnTitre,
);
// router.post(
//   "/titre",
//   verifyToken,
//   authorizePermission("section", "create"),
//   entiteeUnController.createEntiteeUnTitre,
// );
router.put(
  "/titre",
  verifyToken,
  authorizePermission("entiteeUn", "update"),
  entiteeUnController.updateEntiteeUnTitre,
);

// ❌ CES ROUTES DOIVENT ÊTRE APRÈS
router.get(
  "/:id/fonctions",
  verifyToken,
  authorizePermission("entiteeUn", "read"),
  entiteeUnController.getFunctionsByEntiteeUn,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("entiteeUn", "update"),
  entiteeUnController.updateEntiteeUn,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("entiteeUn", "delete"),
  entiteeUnController.deleteEntiteeUn,
);

router.get(
  "/:id/types",
  verifyToken,
  authorizePermission("entiteeUn", "read"),
  entiteeUnController.getTypesOfEntiteeUn,
);

// Ajouter des types de documents à une direction
router.post(
  "/:id/types",
  verifyToken,
  authorizePermission("entiteeUn", "update"),
  entiteeUnController.addTypesToEntiteeUn,
);

// Retirer des types de documents d'une direction
router.delete(
  "/:id/types",
  verifyToken,
  authorizePermission("entiteeUn", "update"),
  entiteeUnController.removeTypesFromEntiteeUn,
);

module.exports = router;
