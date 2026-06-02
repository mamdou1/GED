const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const clientController = require("../controllers/client.controller");

router.use(verifyToken);

// Routes CRUD principales
router.get("/", authorizePermission("client", "read"), clientController.getAll);

router.get(
  "/:id",
  authorizePermission("client", "read"),
  clientController.getById,
);

router.post(
  "/",
  authorizePermission("client", "create"),
  clientController.create,
);

router.put(
  "/:id",
  authorizePermission("client", "update"),
  clientController.update,
);

router.delete(
  "/:id",
  authorizePermission("client", "delete"),
  clientController.remove,
);

router.get(
  "/:id/types-document",
  authorizePermission("client", "read"),
  clientController.getTypesDocumentByClient,
);

module.exports = router;
