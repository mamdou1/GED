const express = require("express");
const router = express.Router();
const entiteeTroisController = require("../controllers/entiteeTrois.controller");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("entiteeTrois", "create"),
  entiteeTroisController.createEntiteeTrois,
);

router.get(
  "/",
  verifyToken,
  authorizePermission("entiteeTrois", "read"),
  entiteeTroisController.getAllEntiteeTrois,
);
router.delete(
  "/titre",
  verifyToken,
  authorizePermission("entiteeTrois", "delete"),
  entiteeTroisController.deleteTitre,
);

// ✅ DÉPLACER ICI
router.get(
  "/titre",
  verifyToken,
  authorizePermission("entiteeTrois", "read"),
  entiteeTroisController.getEntiteeTroisTitre,
);
// router.post(
//   "/titre",
//   verifyToken,
//   authorizePermission("section", "create"),
//   entiteeTroisController.createEntiteeTroisTitre,
// );
router.put(
  "/titre",
  verifyToken,
  authorizePermission("entiteeTrois", "update"),
  entiteeTroisController.updateEntiteeTroisTitre,
);

// ❌ APRÈS
router.get(
  "/by-entiteeTrois/:entiteeDeuxId",
  verifyToken,
  authorizePermission("entiteeTrois", "read"),
  entiteeTroisController.getEntiteeTroisByEntiteeDeux,
);
router.get(
  "/:id/fonctions",
  verifyToken,
  authorizePermission("entiteeTrois", "read"),
  entiteeTroisController.getFunctionsByEntiteeTrois,
);
router.put(
  "/:id",
  verifyToken,
  authorizePermission("entiteeTrois", "update"),
  entiteeTroisController.updateEntiteeTrois,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("entiteeTrois", "delete"),
  entiteeTroisController.deleteEntiteeTrois,
);

router.get(
  "/:id/types",
  verifyToken,
  authorizePermission("entiteeTrois", "read"),
  entiteeTroisController.getTypesOfEntiteeTrois,
);

// Ajouter des types de documents à une direction
router.post(
  "/:id/types",
  verifyToken,
  authorizePermission("entiteeTrois", "update"),
  entiteeTroisController.addTypesToEntiteeTrois,
);

// Retirer des types de documents d'une direction
router.delete(
  "/:id/types",
  verifyToken,
  authorizePermission("entiteeTrois", "update"),
  entiteeTroisController.removeTypesFromEntiteeTrois,
);

module.exports = router;
