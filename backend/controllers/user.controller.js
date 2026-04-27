// controllers/user.controller.js
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email.utils");
const {
  Agent,
  Droit,
  Fonction,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  Permission,
  AgentEntiteeAccess,
} = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

// Helper pour l'inclusion profonde de la hiérarchie de fonction
const fonctionInclude = {
  model: Fonction,
  as: "fonction_details",
  attributes: ["id", "libelle"],
  include: [
    {
      model: EntiteeUn,
      as: "entitee_un",
      attributes: ["id", "libelle", "code", "titre"],
    },
    {
      model: EntiteeDeux,
      as: "entitee_deux",
      attributes: ["id", "libelle", "code", "titre"],
      include: [
        {
          model: EntiteeUn,
          as: "entitee_un",
          attributes: ["id", "libelle", "code"],
        },
      ],
    },
    {
      model: EntiteeTrois,
      as: "entitee_trois",
      attributes: ["id", "libelle", "code", "titre"],
      include: [
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle", "code"],
          include: [
            {
              model: EntiteeUn,
              as: "entitee_un",
              attributes: ["id", "libelle", "code"],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * ✅ Inclusion des accès agent_entitee_access
 */
const agentAccessInclude = {
  model: AgentEntiteeAccess,
  as: "agent_access",
  attributes: ["id", "created_at", "updated_at"],
  include: [
    {
      model: EntiteeUn,
      as: "entitee_un",
      attributes: ["id", "libelle", "code", "titre"],
      required: false,
    },
    {
      model: EntiteeDeux,
      as: "entitee_deux",
      attributes: ["id", "libelle", "code", "titre"],
      include: [
        {
          model: EntiteeUn,
          as: "entitee_un",
          attributes: ["id", "libelle", "code"],
        },
      ],
      required: false,
    },
    {
      model: EntiteeTrois,
      as: "entitee_trois",
      attributes: ["id", "libelle", "code", "titre"],
      include: [
        {
          model: EntiteeDeux,
          as: "entitee_deux",
          attributes: ["id", "libelle", "code"],
          include: [
            {
              model: EntiteeUn,
              as: "entitee_un",
              attributes: ["id", "libelle", "code"],
            },
          ],
        },
      ],
      required: false,
    },
  ],
};

/**
 * ✅ Créer un utilisateur (par ADMIN)
 */
exports.createUser = async (req, res) => {
  const startTime = Date.now();

  try {
    const { nom, prenom, email, telephone, num_matricule, droit, fonction } =
      req.body;

    logger.info("📝 Tentative de création d'un utilisateur", {
      userId: req.user?.id,
      body: { ...req.body, password: "[HIDDEN]" },
    });

    const existingUser = await Agent.findOne({
      where: { [Op.or]: [{ email }, { telephone }] },
    });

    if (existingUser) {
      logger.warn("⚠️ Email ou téléphone déjà utilisé", {
        email,
        telephone,
        userId: req.user?.id,
      });
      return res
        .status(400)
        .json({ message: "Email ou téléphone déjà utilisé." });
    }

    const passwordGenerated =
      nom.slice(0, 2).toLowerCase() +
      prenom.slice(0, 2).toLowerCase() +
      telephone.replace(/\D/g, "").slice(0, 4);

    const usernames =
      nom.toLowerCase() + telephone.replace(/\D/g, "").slice(0, 2);

    const hashedPassword = await bcrypt.hash(passwordGenerated, 10);
    const photoProfil = req.file ? req.file.filename : "";

    const newUser = await Agent.create({
      nom,
      prenom,
      email,
      telephone,
      num_matricule,
      password: hashedPassword,
      username: usernames,
      enregistrer_par_id: req.user.id,
      photo_profil: photoProfil,
      droit_id: droit,
      fonction_id: fonction,
    });

    // Email de bienvenue
    const message = `Bonjour ${prenom} ${nom},\n\nIdentifiant : ${usernames}\nMot de passe : ${passwordGenerated}\n`;
    await sendEmail(email, "Bienvenue sur la plateforme", message);

    logger.info("✅ Utilisateur créé avec succès", {
      userId: req.user?.id,
      newUserId: newUser.id,
      username: usernames,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "agent", newUser);

    res.status(201).json({ message: "Utilisateur créé", user: newUser });
  } catch (err) {
    logger.error("❌ Erreur création utilisateur:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Erreur création", error: err.message });
  }
};

/**
 * ✅ Récupérer tous les utilisateurs
 */
exports.getUsers = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de tous les utilisateurs", {
      userId: req.user?.id,
      query: req.query,
    });

    const users = await Agent.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Droit,
          as: "droit",
          //attributes: ["id", "libelle", "createdAt", "updatedAt"],
          include: [
            {
              model: Permission,
              as: "Permissions",
              attributes: ["id", "resource", "action"],
            },
          ],
        },
        fonctionInclude,
        agentAccessInclude,
      ],
    });

    logger.info("✅ Utilisateurs récupérés", {
      count: users.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "agent",
        resource_id: null,
        resource_identifier: "liste des utilisateurs",
        description: "Consultation de la liste des utilisateurs",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: users.length,
          duration: Date.now() - startTime,
        },
      });
    }

    res.status(200).json(users);
  } catch (err) {
    logger.error("❌ Erreur récupération utilisateurs:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res
      .status(500)
      .json({ message: "Erreur récupération", erreur: err.message });
  }
};

/**
 * ✅ Récupérer un utilisateur par ID
 */
exports.getUsersById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Recherche d'un utilisateur par ID", {
      userId: id,
      requestBy: req.user?.id,
    });

    const user = await Agent.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: Agent, as: "createur", attributes: ["nom", "prenom"] },
        {
          model: Droit,
          as: "droit",
          //attributes: ["id", "libelle", "createdAt", "updatedAt"],
          include: [
            {
              model: Permission,
              as: "Permissions",
              attributes: ["id", "resource", "action"],
            },
          ],
        },
        fonctionInclude,
        agentAccessInclude,
      ],
    });

    if (!user) {
      logger.warn("⚠️ Utilisateur non trouvé", {
        userId: id,
        requestBy: req.user?.id,
      });
      return res.status(404).json({ message: "Non trouvé" });
    }

    logger.info("✅ Utilisateur trouvé", {
      userId: id,
      nom: `${user.prenom} ${user.nom}`,
      requestBy: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "agent",
      resource_id: user.id,
      resource_identifier: `${user.prenom} ${user.nom} (${user.id})`,
      description: `Consultation du profil de ${user.prenom} ${user.nom}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
      },
    });

    res.json(user);
  } catch (err) {
    logger.error("❌ Erreur recherche utilisateur:", {
      userId: id,
      error: err.message,
      stack: err.stack,
      requestBy: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ Mise à jour par ADMIN
 */
exports.updateUserByAdmin = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'un utilisateur (admin)", {
      targetUserId: id,
      adminId: req.user?.id,
      body: {
        ...req.body,
        password: req.body.password ? "[HIDDEN]" : undefined,
      },
    });

    const oldUser = await Agent.findByPk(id);
    if (!oldUser) {
      logger.warn("⚠️ Utilisateur non trouvé pour mise à jour", {
        targetUserId: id,
        adminId: req.user?.id,
      });
      return res.status(404).json({ message: "Non trouvé" });
    }

    const oldCopy = oldUser.toJSON();
    const payload = req.body;

    // Mapping des IDs provenant du frontend
    if (payload.droit) {
      payload.droit_id = payload.droit;
      delete payload.droit;
    }
    if (payload.fonction) {
      payload.fonction_id = payload.fonction;
      delete payload.fonction;
    }

    // Vérification unicité si email/tel modifiés
    if (payload.email && payload.email !== oldUser.email) {
      const exist = await Agent.findOne({ where: { email: payload.email } });
      if (exist) {
        logger.warn("⚠️ Email déjà utilisé", {
          email: payload.email,
          targetUserId: id,
          adminId: req.user?.id,
        });
        return res.status(400).json({ message: "Email utilisé" });
      }
    }

    if (payload.telephone && payload.telephone !== oldUser.telephone) {
      const exist = await Agent.findOne({
        where: { telephone: payload.telephone },
      });
      if (exist) {
        logger.warn("⚠️ Téléphone déjà utilisé", {
          telephone: payload.telephone,
          targetUserId: id,
          adminId: req.user?.id,
        });
        return res.status(400).json({ message: "Téléphone utilisé" });
      }
    }

    if (payload.password)
      payload.password = await bcrypt.hash(payload.password, 10);
    if (req.file) payload.photo_profil = req.file.filename;

    await oldUser.update(payload);

    const updatedUser = await Agent.findByPk(id);

    logger.info("✅ Utilisateur mis à jour avec succès (admin)", {
      targetUserId: id,
      adminId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "agent", oldCopy, updatedUser);

    const { password, ...safeUser } = updatedUser.toJSON();
    res.json({ message: "Mis à jour", user: safeUser });
  } catch (err) {
    logger.error("❌ Erreur mise à jour utilisateur (admin):", {
      targetUserId: id,
      error: err.message,
      stack: err.stack,
      adminId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ Mise à jour du profil par l'utilisateur lui-même
 */
exports.updateUserProfil = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour du profil", {
      userId: id,
      body: {
        ...req.body,
        password: req.body.password ? "[HIDDEN]" : undefined,
      },
    });

    const oldUser = await Agent.findByPk(id);
    if (!oldUser) {
      logger.warn("⚠️ Utilisateur non trouvé pour mise à jour profil", {
        userId: id,
      });
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const oldCopy = oldUser.toJSON();
    const payload = req.body;

    // Mapping des IDs
    if (payload.droit !== undefined) {
      payload.droit_id = payload.droit;
      delete payload.droit;
    }

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    if (req.file) {
      payload.photo_profil = req.file.filename;
    }

    await oldUser.update(payload);

    const updatedUser = await Agent.findByPk(id);

    logger.info("✅ Profil mis à jour avec succès", {
      userId: id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "agent", oldCopy, updatedUser);

    const { password, ...safeUser } = updatedUser.toJSON();
    res.json({
      message: "Profil mis à jour avec succès",
      user: safeUser,
    });
  } catch (err) {
    logger.error("❌ Erreur mise à jour profil:", {
      userId: id,
      error: err.message,
      stack: err.stack,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur mise à jour profil",
      error: err.message,
    });
  }
};

/**
 * ✅ Suppression d'un utilisateur
 */
exports.deleteMembre = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un utilisateur", {
      targetUserId: id,
      adminId: req.user?.id,
    });

    const user = await Agent.findByPk(id);
    if (!user) {
      logger.warn("⚠️ Utilisateur non trouvé pour suppression", {
        targetUserId: id,
        adminId: req.user?.id,
      });
      return res.status(404).json({ message: "Introuvable" });
    }

    await user.destroy();

    logger.info("✅ Utilisateur supprimé avec succès", {
      targetUserId: id,
      nom: `${user.prenom} ${user.nom}`,
      adminId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "agent", user);

    res.json({ message: "Supprimé avec succès" });
  } catch (err) {
    logger.error("❌ Erreur suppression utilisateur:", {
      targetUserId: id,
      error: err.message,
      stack: err.stack,
      adminId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ Récupérer le profil de l'utilisateur connecté
 */
exports.getMe = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération du profil utilisateur connecté", {
      userId: req.user?.id,
    });

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      logger.warn("⚠️ Token manquant pour getMe");
      return res.status(401).json({ message: "Token manquant" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const agent = await Agent.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
      include: [
        fonctionInclude,
        agentAccessInclude,
        {
          model: Droit,
          as: "droit",
          //attributes: ["id", "libelle", "createdAt", "updatedAt"],
          include: [
            {
              model: Permission,
              as: "Permissions",
              attributes: ["id", "resource", "action"],
            },
          ],
        },
      ],
    });

    if (!agent) {
      logger.warn("⚠️ Agent non trouvé", { userId: decoded.id });
      return res.status(404).json({ message: "Agent non trouvé" });
    }

    logger.info("✅ Profil complète de l'agent", {
      droit: agent,
    });

    logger.info("✅ Profil utilisateur récupéré", {
      userId: agent.id,
      nom: `${agent.prenom} ${agent.nom}`,
      duration: Date.now() - startTime,
    });

    res.json(agent);
  } catch (err) {
    logger.error("❌ Erreur getMe:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * ✅ Compter les membres (obsolète ?)
 */
exports.countMembres = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Comptage des membres", {
      userId: req.user?.id,
    });

    const count = await Agent.count({
      where: {
        role: { [Op.in]: ["MEMBRE", "MEMBRE_AUTHORIZE"] },
      },
    });

    logger.info("✅ Comptage membres terminé", {
      count,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json({ totalMembres: count });
  } catch (err) {
    logger.error("❌ Erreur comptage membres:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Erreur comptage membres",
      error: err.message,
    });
  }
};

/**
 * ✅ Récupérer les utilisateurs en ligne
 */
exports.getOnlineUsers = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération des utilisateurs en ligne", {
      userId: req.user?.id,
    });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const users = await Agent.findAll({
      where: {
        is_on_line: true,
        last_activity: {
          [Op.gte]: fiveMinutesAgo,
        },
      },
      attributes: ["id", "nom", "prenom", "last_activity"],
    });

    logger.info("✅ Utilisateurs en ligne récupérés", {
      count: users.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(users);
  } catch (err) {
    logger.error("❌ Erreur récupération utilisateurs en ligne:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({ error: err.message });
  }
};
