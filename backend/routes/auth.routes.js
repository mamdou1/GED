//const express = require("express");
//// const { verifyToken } = require("../middlewares/auth.middleware");
//const {
//  connexion,
//  deconnexion,
//  refresh,
//  forgotPassword,
//  verifyAndReset,
//  updatePassword,
//  inscription,
//  changerPassword,
//  createGymWithAdmin,
//} = require("../controllers/auth.controller");
//const { verifyToken } = require("../middlewares/auth.middleware");
////const {authorizeRoles} = require("../middlewares/role.middleware")
//
//const router = express.Router();
//
//router.post("/inscription", inscription);
////router.post("/", createGymWithAdmin);
//router.post("/connexion", connexion);
//router.post("/deconnexion", verifyToken, deconnexion);
//router.post("/refresh", refresh);
//router.post("/forgot-password", forgotPassword);
//router.post("/verify-reset-password", verifyToken, verifyAndReset);
//router.post("/change-forgot-password", verifyToken, updatePassword);
//router.post("/change-password", verifyToken, changerPassword);
//router.get("/me", verifyToken);
//module.exports = router;
// backend/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const {
  inscription,
  connexion,
  deconnexion,
  refresh,
  forgotPassword,
  verifyAndReset,
  updatePassword,
  changerPassword,
} = require("../controllers/auth.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification et gestion des utilisateurs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// ===================== ROUTES PUBLIQUES =====================

/**
 * @swagger
 * /api/auth/inscription:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, email]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               email:
 *                 type: string
 *                 example: "admin@mail.com"
 *               nom:
 *                 type: string
 *                 example: "Doe"
 *               prenom:
 *                 type: string
 *                 example: "John"
 *               telephone:
 *                 type: string
 *                 example: "700000000"
 *               fonction_id:
 *                 type: string
 *                 example: "5"
 *               num_matricule:
 *                 type: string
 *                 example: "MAT001"
 *     responses:
 *       201:
 *         description: Inscription réussie
 *       400:
 *         description: Données invalides
 */
router.post("/inscription", inscription);

/**
 * @swagger
 * /api/auth/connexion:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Connexion réussie (retourne accessToken + refreshToken)
 *       401:
 *         description: Identifiants incorrects
 */
router.post("/connexion", connexion);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@mail.com"
 *     responses:
 *       200:
 *         description: Email envoyé avec code de vérification
 */
router.post("/forgot-password", forgotPassword);

// ===================== ROUTES PROTÉGÉES =====================

/**
 * @swagger
 * /api/auth/deconnexion:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post("/deconnexion", verifyToken, deconnexion);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "votre_refresh_token"
 *     responses:
 *       200:
 *         description: Nouveau accessToken retourné
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /api/auth/verify-reset-password:
 *   post:
 *     summary: Vérifier le code de réinitialisation
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "ABC123"
 *     responses:
 *       200:
 *         description: Code vérifié avec succès
 */
router.post("/verify-reset-password", verifyToken, verifyAndReset);

/**
 * @swagger
 * /api/auth/change-forgot-password:
 *   post:
 *     summary: Changer le mot de passe après réinitialisation
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 */
router.post("/change-forgot-password", verifyToken, updatePassword);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Changer le mot de passe (utilisateur connecté)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 */
router.post("/change-password", verifyToken, changerPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 */
router.get("/me", verifyToken, (req, res) => {
  res.json(req.user);
});

module.exports = router;