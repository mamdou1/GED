//// backend/routes/courrier.routes.js
//const router = require("express").Router();
//const ctrl = require("../controllers/courrier.controller");
//const { verifyToken } = require("../middlewares/auth.middleware");
//const {
//  authorizePermission,
//} = require("../middlewares/authorizePermission.middleware");
//const upload = require("../middlewares/upload");
//
//// Toutes les routes nécessitent un token valide
//router.use(verifyToken);
//
//// ===================== ROUTES DE CONSULTATION =====================
//
//// Liste principale des courriers
//router.get(
//  "/",
//  authorizePermission("courrier", "read"),
//  ctrl.getAll
//);
//
//// Détail d'un courrier
//router.get(
//  "/:idcourrier",
//  authorizePermission("courrier", "read"),
//  ctrl.getById
//);
//
//// Recherche
//router.get(
//  "/search",
//  authorizePermission("courrier", "read"),
//  ctrl.search
//);
//
//// Statistiques globales
//router.get(
//  "/statistiques",
//  authorizePermission("courrier", "read"),
//  ctrl.getStatistiques
//);
//
//// Courriers en retard
//router.get(
//  "/en-retard",
//  authorizePermission("courrier", "read"),
//  ctrl.getCourriersEnRetard
//);
//
//// Audit d'un courrier
//router.get(
//  "/:idcourrier/audit",
//  authorizePermission("courrier", "read"),
//  ctrl.getAudit
//);
//
//// Mes courriers attribués
//router.get(
//  "/mes-attribues",
//  authorizePermission("courrier", "read"),
//  ctrl.getMesAttribues
//);
//
//// ===================== ROUTES DE GESTION =====================
//
//// Créer un courrier (avec upload de fichiers)
//router.post(
//  "/",
//  authorizePermission("courrier", "create"),
//  upload.array("files", 10),
//  ctrl.create
//);
//
//// Valider un courrier
//router.patch(
//  "/:idcourrier/valider",
//  authorizePermission("courrier", "update"),
//  ctrl.valider
//);
//
//// Rejeter un courrier
//router.patch(
//  "/:idcourrier/rejeter",
//  authorizePermission("courrier", "update"),
//  ctrl.rejeter
//);
//
//// Attribuer un courrier
//router.post(
//  "/:idcourrier/attribuer",
//  authorizePermission("courrier", "update"),
//  ctrl.attribuer
//);
//
//// Traiter un courrier
//router.post(
//  "/:idcourrier/traiter",
//  authorizePermission("courrier", "update"),
//  ctrl.traiter
//);
//
//// ===================== ROUTES POUR PIÈCES JOINTES =====================
//
//// Récupérer les pièces jointes
//router.get(
//  "/:idcourrier/pieces-jointes",
//  authorizePermission("courrier", "read"),
//  async (req, res) => {
//    // Tu peux déplacer cette logique dans le controller si tu préfères
//    try {
//      const pieces = await CourrierService.getPiecesJointes(req.params.idcourrier);
//      res.json({ success: true, data: pieces });
//    } catch (error) {
//      res.status(500).json({ success: false, message: error.message });
//    }
//  }
//);
//
//// Ajouter des pièces jointes
//router.post(
//  "/:idcourrier/pieces-jointes",
//  authorizePermission("courrier", "update"),
//  upload.array("files", 10),
//  async (req, res) => {
//    try {
//      const files = req.files || [];
//      if (files.length === 0) {
//        return res.status(400).json({ success: false, message: "Aucun fichier fourni" });
//      }
//      await CourrierService.addPiecesJointes(req.params.idcourrier, files);
//      res.json({ success: true, message: `${files.length} pièce(s) ajoutée(s)` });
//    } catch (error) {
//      res.status(500).json({ success: false, message: error.message });
//    }
//  }
//);
//
//module.exports = router;
// backend/routes/courrier.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/courrier.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  authorizePermission,
} = require("../middlewares/authorizePermission.middleware");
const upload = require("../middlewares/upload");

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
router.get("/", authorizePermission("courrier", "read"), ctrl.getAll);

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
 *     responses:
 *       200:
 *         description: Courrier trouvé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Courrier non trouvé
 */
router.get("/:id", authorizePermission("courrier", "read"), ctrl.getById);

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
router.get("/search", authorizePermission("courrier", "read"), ctrl.search);

/**
 * @swagger
 * /api/courrier/statistiques:
 *   get:
 *     summary: Statistiques globales des courriers
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 */
router.get("/statistiques", authorizePermission("courrier", "read"), ctrl.getStatistiques);

/**
 * @swagger
 * /api/courrier/en-retard:
 *   get:
 *     summary: Courriers en retard
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 */
router.get("/en-retard", authorizePermission("courrier", "read"), ctrl.getCourriersEnRetard);

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
router.get("/:id/audit", authorizePermission("courrier", "read"), ctrl.getAudit);

/**
 * @swagger
 * /api/courrier/mes-attribues:
 *   get:
 *     summary: Mes courriers attribués
 *     tags: [Courrier]
 *     security:
 *       - bearerAuth: []
 */
router.get("/mes-attribues", authorizePermission("courrier", "read"), ctrl.getMesAttribues);

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
  ctrl.create
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
router.patch("/:id/valider", authorizePermission("courrier", "update"), ctrl.valider);

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
router.patch("/:id/rejeter", authorizePermission("courrier", "update"), ctrl.rejeter);

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
 */
router.post("/:id/attribuer", authorizePermission("courrier", "update"), ctrl.attribuer);

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
 */
router.post("/:id/traiter", authorizePermission("courrier", "update"), ctrl.traiter);

/**
 * @swagger
 * /api/courrier/{id}/transferer:
 *   post:
 *     summary: Transférer un courrier vers une autre direction
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
 *               nouvelleDirectionId:
 *                 type: integer
 *                 description: ID de la nouvelle direction
 *               motif:
 *                 type: string
 *                 description: Motif du transfert (optionnel)
 */
router.post("/:id/transferer", authorizePermission("courrier", "update"), ctrl.transferer);

// ===================== PIÈCES JOINTES =====================

/**
 * @swagger
 * /api/courrier/{id}/pieces-jointes:
 *   get:
 *     summary: Récupérer les pièces jointes
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
router.get("/:id/pieces-jointes", authorizePermission("courrier", "read"), ctrl.getPiecesJointes);

/**
 * @swagger
 * /api/courrier/{id}/pieces-jointes:
 *   post:
 *     summary: Ajouter des pièces jointes
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
  async (req, res) => {
    try {
      const files = req.files || [];
      if (files.length === 0) {
        return res.status(400).json({ success: false, message: "Aucun fichier fourni" });
      }
      await CourrierService.addPiecesJointes(req.params.id, files);
      res.json({ 
        success: true, 
        message: `${files.length} pièce(s) jointe(s) ajoutée(s)` 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;