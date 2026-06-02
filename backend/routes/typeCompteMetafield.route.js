const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const ctrl = require("../controllers/typeCompteMetaField.controller");

router.use(verifyToken);

router.get("/:typeId", authorizePermission("typeCompte", "read"), ctrl.getByType);
router.post(
  "/:typeId",
  authorizePermission("typeCompte", "create"),
  ctrl.create,
);
router.put("/:id", authorizePermission("typeCompte", "update"), ctrl.update);
router.delete("/:id", authorizePermission("typeCompte", "delete"), ctrl.remove);

module.exports = router;
