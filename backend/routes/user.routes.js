const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const {
  createUser,
  getUsers,
  getUsersById,
  updateUserByAdmin,
  updateUserProfil,
  countMembres,
  getMe,
  deleteMembre,
  getOnlineUsers,
  desableUserCompte,
  enableUserCompte,
} = require("../controllers/user.controller");
const upload = require("../middlewares/upload.middleware");

router.post(
  "/",
  verifyToken,
  authorizePermission("agent", "create"),
  upload.single("photoProfil"),
  createUser,
);
router.get("/", verifyToken, authorizePermission("agent", "read"), getUsers);
router.get(
  "/online",
  verifyToken,
  authorizePermission("agent", "read"),
  getOnlineUsers,
);
router.get(
  "/totalMembre",
  verifyToken,
  authorizePermission("exercice", "read"),
  countMembres,
);
router.get("/me", verifyToken, getMe);

router.get(
  "/:id",
  verifyToken,
  authorizePermission("agent", "read"),
  getUsersById,
);
router.patch(
  "/desable/:id",
  verifyToken,
  authorizePermission("agent", "update"),
  desableUserCompte,
);
router.patch(
  "/enable/:id",
  verifyToken,
  authorizePermission("agent", "update"),
  enableUserCompte,
);
router.put(
  "/update-by-admin/:id",
  verifyToken,
  authorizePermission("agent", "update"),
  upload.single("photoProfil"),
  updateUserByAdmin,
);
router.put(
  "/update-profil/:id",
  verifyToken,
  upload.single("photoProfil"),
  updateUserProfil,
);
router.delete(
  "/:id",
  verifyToken,
  authorizePermission("agent", "delete"),
  deleteMembre,
);

module.exports = router;
