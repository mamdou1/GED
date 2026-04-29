const router = require("express").Router();
const ctrl = require("../controllers/rayon.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("rayon", "create"),
  ctrl.create,
);

router.get(
  "/",
  verifyToken,
  authorizePermission("rayon", "read"),
  ctrl.getRayons,
);

router.get(
  "/:id/trave",
  verifyToken,
  authorizePermission("rayon", "read"),
  ctrl.getAllTraveByRayon,
);

router.get(
  "/:id",
  verifyToken,
  authorizePermission("rayon", "read"),
  ctrl.getRayonById,
);

router.put(
  "/:id",
  verifyToken,
  authorizePermission("rayon", "update"),
  ctrl.update,
);

router.delete(
  "/:id",
  verifyToken,
  authorizePermission("rayon", "delete"),
  ctrl.delete,
);

module.exports = router;
