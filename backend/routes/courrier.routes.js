// backend/routes/courrier.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const CourrierController = require("../controllers/courrier.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");

// Toutes les routes nécessitent un token valide
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Courrier
 *   description: Gestion des courriers (arrivés / départs)
 */

// ===================== ROUTES DE CONSULTATION =====================

/**
 * @swagger
 * /api/courrier:
 *   get:
 *     summary: Liste tous les courriers (avec filtres)
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ARRIVE, DEPART]
 *         description: Type de courrier
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [EN_ATTENTE, VALIDÉ, REJETÉ, ATTRIBUÉ, EN_COURS, TRAITE, ARCHIVE, RENVOYE]
 *         description: Statut du courrier
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (YYYY-MM-DD)
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (YYYY-MM-DD)
 */
router.get("/", authorizePermission("courrier", "read"), CourrierController.getAll);

/**
 * @swagger
 * /api/courrier/search:
 *   get:
 *     summary: Rechercher des courriers
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 */
router.get("/search", authorizePermission("courrier", "read"), CourrierController.search);

/**
 * @swagger
 * /api/courrier/statistiques:
 *   get:
 *     summary: Statistiques globales des courriers
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 */
router.get("/statistiques", authorizePermission("courrier", "read"), CourrierController.getStatistiques);

/**
 * @swagger
 * /api/courrier/en-retard:
 *   get:
 *     summary: Courriers en retard
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 */
router.get("/en-retard", authorizePermission("courrier", "read"), CourrierController.getCourriersEnRetard);

/**
 * @swagger
 * /api/courrier/mes-attribues:
 *   get:
 *     summary: Mes courriers attribués
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 */
router.get("/mes-attribues", authorizePermission("courrier", "read"), CourrierController.getMesAttribues);

/**
 * @swagger
 * /api/courrier/{id}/audit:
 *   get:
 *     summary: Audit d'un courrier
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 */
router.get("/:id/audit", authorizePermission("courrier", "read"), CourrierController.getAudit);

/**
 * @swagger
 * /api/courrier/{id}:
 *   get:
 *     summary: Détail d'un courrier
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 */
router.get("/:id", authorizePermission("courrier", "read"), CourrierController.getById);

// ===================== ROUTES DE GESTION =====================

/**
 * @swagger
 * /api/courrier:
 *   post:
 *     summary: Créer un nouveau courrier
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authorizePermission("courrier", "create"),
  upload.array("files", 10),
  CourrierController.create
);

/**
 * @swagger
 * /api/courrier/{id}/valider:
 *   patch:
 *     summary: Valider un courrier
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 */
router.patch("/:id/valider", authorizePermission("courrier", "update"), CourrierController.valider);

/**
 * @swagger
 * /api/courrier/{id}/rejeter:
 *   patch:
 *     summary: Rejeter un courrier
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motif:
 *                 type: string
 *                 description: Raison du rejet
 */
router.patch("/:id/rejeter", authorizePermission("courrier", "update"), CourrierController.rejeter);

/**
 * @swagger
 * /api/courrier/{id}/attribuer:
 *   post:
 *     summary: Attribuer un courrier à un agent
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destinataire_idagent:
 *                 type: integer
 *                 description: ID de l'agent destinataire
 *               date_limite_traitement:
 *                 type: string
 *                 format: date-time
 *                 description: Date limite de traitement
 *               instructions:
 *                 type: string
 *                 description: Instructions
 *               commentaire:
 *                 type: string
 *                 description: Commentaire
 */
// router.post("/:id/attribuer", authorizePermission("courrier", "update"), CourrierController.attribuer);

/**
 * @swagger
 * /api/courrier/{id}/attribuer-entite:
 *   post:
 *     summary: Attribuer un courrier à une entité (Division/Bureau)
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entiteeId:
 *                 type: integer
 *                 description: ID de l'entité
 *               entiteeType:
 *                 type: string
 *                 enum: [EntiteeDeux, EntiteeTrois]
 *                 description: Type d'entité
 *               motif:
 *                 type: string
 *                 description: Motif de l'attribution
 */
// router.post(
//   "/:id/attribuer-entite",
//   authorizePermission("courrier", "update"),
//   CourrierController.attribuerAEntite
// );

/**
 * @swagger
 * /api/courrier/{id}/attribuer-multiple:
 *   post:
 *     summary: Attribuer un courrier à plusieurs destinataires (agents + entités)
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attributions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [agent, entiteeDeux, entiteeTrois]
 *                     id:
 *                       type: integer
 *                     date_limite_traitement:
 *                       type: string
 *                       format: date-time
 *                     instructions:
 *                       type: string
 *                     commentaire:
 *                       type: string
 */
router.post(
  "/:id/attribuer-multiple",
  authorizePermission("courrier", "update"),
  CourrierController.attribuerMultiple
);

/**
 * @swagger
 * /api/courrier/{id}/traiter:
 *   post:
 *     summary: Traiter un courrier
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 description: Action effectuée
 *               nouveau_statut:
 *                 type: string
 *                 description: Nouveau statut
 *               motif:
 *                 type: string
 *                 description: Motif du traitement
 */
router.post("/:id/traiter", authorizePermission("courrier", "update"), CourrierController.traiter);

/**
 * @swagger
 * /api/courrier/{id}/transferer-interne:
 *   post:
 *     summary: Réattribuer un courrier à un autre agent de la même direction (Transfert interne)
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nouveauDestinataireId:
 *                 type: integer
 *                 description: ID de l'agent destinataire
 *               motif:
 *                 type: string
 *                 description: Motif du transfert (optionnel)
 */
router.post("/:id/transferer-interne", authorizePermission("courrier", "update"), CourrierController.transfererInterne);

// ===================== PIÈCES JOINTES =====================

/**
 * @swagger
 * /api/courrier/{id}/pieces-jointes:
 *   get:
 *     summary: Récupérer les pièces jointes d'un courrier
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 */
router.get("/:id/pieces-jointes", authorizePermission("courrier", "read"), CourrierController.getPiecesJointes);

/**
 * @swagger
 * /api/courrier/{id}/pieces-jointes:
 *   post:
 *     summary: Ajouter des pièces jointes à un courrier
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du courrier
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Fichiers à joindre (max 10)
 */
router.post(
  "/:id/pieces-jointes",
  authorizePermission("courrier", "update"),
  upload.array("files", 10),
  CourrierController.addPiecesJointes
);

module.exports = router;