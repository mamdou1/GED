const { Op } = require("sequelize");
const {
  Client,
  TypeDocument,
  Agent,
  ClientTypeDocument,
  Document,
  Compte,
  sequelize,
} = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");

exports.getAll = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de tous les clients", {
      userId: req.user?.id,
      query: req.query,
    });

    const { search, conserne, limit = 100, offset = 0 } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { prenom: { [Op.like]: `%${search}%` } },
        { raison_sociale: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { telephone: { [Op.like]: `%${search}%` } },
        { num_matricule: { [Op.like]: `%${search}%` } },
      ];
    }

    if (conserne) {
      where.conserne = conserne;
    }

    const { count, rows } = await Client.findAndCountAll({
      where,
      include: [
        {
          model: Agent,
          as: "createur",
          attributes: ["id", "nom", "prenom"],
          required: false,
        },
        {
          model: TypeDocument,
          as: "types_document",
          attributes: ["id", "code", "nom", "conserne"],
          through: { attributes: [] },
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    logger.info("✅ Clients récupérés", {
      count: rows.length,
      total: count,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "client",
        resource_id: null,
        resource_identifier: "liste des clients",
        description: "Consultation de la liste des clients",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: rows.length,
          total: count,
          duration: Date.now() - startTime,
        },
      });
    }

    res.json({
      success: true,
      data: rows,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    logger.error("❌ Erreur récupération clients:", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des clients",
      error: err.message,
    });
  }
};

exports.getById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Recherche d'un client par ID", {
      clientId: id,
      userId: req.user?.id,
    });

    const client = await Client.findByPk(id, {
      include: [
        {
          model: Agent,
          as: "createur",
          attributes: ["id", "nom", "prenom"],
          required: false,
        },
        {
          model: TypeDocument,
          as: "types_document",
          attributes: ["id", "code", "nom", "conserne"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    if (!client) {
      logger.warn("⚠️ Client non trouvé", {
        clientId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    logger.info("✅ Client trouvé", {
      clientId: id,
      nom: client.raison_sociale || `${client.prenom} ${client.nom}`,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "client",
      resource_id: client.id,
      resource_identifier:
        client.raison_sociale || `${client.prenom} ${client.nom}`,
      description: `Consultation du client #${client.id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
      },
    });

    res.json({
      success: true,
      data: client,
    });
  } catch (err) {
    logger.error("❌ Erreur recherche client:", {
      clientId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche du client",
      error: err.message,
    });
  }
};

exports.create = async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      nom,
      prenom,
      raison_sociale,
      num_matricule,
      email,
      sigle,
      telephone,
      adresse,
      lieu_naissance,
      nationalite,
      profession,
      statut_matrimonial,
      date_naissance,
      numero_registre_commerce,
      nif,
      conserne,
    } = req.body;

    logger.info("📝 Tentative de création d'un client", {
      userId: req.user?.id,
      body: { ...req.body },
    });

    // Vérifier les doublons
    const duplicateConditions = [
      email ? { email } : null,
      telephone ? { telephone } : null,
      sigle ? { sigle } : null,
    ].filter(Boolean);

    const existingClient =
      duplicateConditions.length > 0
        ? await Client.findOne({
            where: {
              [Op.or]: duplicateConditions,
            },
          })
        : null;

    if (existingClient) {
      logger.warn("⚠️ Client déjà existant (email, téléphone ou sigle)", {
        email,
        telephone,
        sigle,
        userId: req.user?.id,
      });
      return res.status(400).json({
        success: false,
        message: "Un client avec cet email, téléphone ou sigle existe déjà",
      });
    }

    // Générer un numéro de matricule si non fourni
    let matricule = num_matricule;
    if (!matricule) {
      const count = await Client.count();
      const prefix = "CLT";
      const year = new Date().getFullYear();
      const sequence = String(count + 1).padStart(5, "0");
      matricule = `${prefix}-${year}-${sequence}`;
    }

    const client = await Client.create({
      nom: nom || null,
      prenom: prenom || null,
      raison_sociale: raison_sociale || null,
      num_matricule: matricule,
      email: email || null,
      sigle: sigle || null,
      telephone: telephone || null,
      adresse: adresse || null,
      lieu_naissance: lieu_naissance || null,
      nationalite: nationalite || null,
      profession: profession || null,
      statut_matrimonial: statut_matrimonial || null,
      date_naissance: date_naissance || null,
      numero_registre_commerce: numero_registre_commerce || null,
      nif: nif || null,
      conserne: conserne || null,
      enregistrer_par: req.user?.id || null,
    });

    logger.info("✅ Client créé avec succès", {
      clientId: client.id,
      matricule: client.num_matricule,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logCreate(req, "client", client);

    res.status(201).json({
      success: true,
      message: "Client créé avec succès",
      data: client,
    });
  } catch (err) {
    logger.error("❌ Erreur création client:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du client",
      error: err.message,
    });
  }
};

exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de mise à jour d'un client", {
      clientId: id,
      userId: req.user?.id,
      body: { ...req.body },
    });

    const oldClient = await Client.findByPk(id);
    if (!oldClient) {
      logger.warn("⚠️ Client non trouvé pour mise à jour", {
        clientId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    const oldCopy = oldClient.toJSON();

    const {
      nom,
      prenom,
      raison_sociale,
      num_matricule,
      email,
      sigle,
      telephone,
      adresse,
      lieu_naissance,
      nationalite,
      profession,
      statut_matrimonial,
      date_naissance,
      numero_registre_commerce,
      nif,
      conserne,
    } = req.body;

    // Vérifier les doublons (exclure l'élément actuel)
    const duplicateConditions = [
      email ? { email } : null,
      telephone ? { telephone } : null,
      sigle ? { sigle } : null,
    ].filter(Boolean);

    const existingClient =
      duplicateConditions.length > 0
        ? await Client.findOne({
            where: {
              id: { [Op.ne]: id },
              [Op.or]: duplicateConditions,
            },
          })
        : null;

    if (existingClient) {
      logger.warn("⚠️ Conflit mise à jour - doublon détecté", {
        clientId: id,
        email,
        telephone,
        sigle,
        userId: req.user?.id,
      });
      return res.status(400).json({
        success: false,
        message:
          "Un autre client avec cet email, téléphone ou sigle existe déjà",
      });
    }

    await oldClient.update({
      nom: nom !== undefined ? nom : oldClient.nom,
      prenom: prenom !== undefined ? prenom : oldClient.prenom,
      raison_sociale:
        raison_sociale !== undefined
          ? raison_sociale
          : oldClient.raison_sociale,
      num_matricule: num_matricule || oldClient.num_matricule,
      email: email !== undefined ? email : oldClient.email,
      sigle: sigle !== undefined ? sigle : oldClient.sigle,
      telephone: telephone !== undefined ? telephone : oldClient.telephone,
      adresse: adresse !== undefined ? adresse : oldClient.adresse,
      lieu_naissance:
        lieu_naissance !== undefined
          ? lieu_naissance
          : oldClient.lieu_naissance,
      nationalite:
        nationalite !== undefined ? nationalite : oldClient.nationalite,
      profession: profession !== undefined ? profession : oldClient.profession,
      statut_matrimonial:
        statut_matrimonial !== undefined
          ? statut_matrimonial
          : oldClient.statut_matrimonial,
      date_naissance:
        date_naissance !== undefined
          ? date_naissance
          : oldClient.date_naissance,
      numero_registre_commerce:
        numero_registre_commerce !== undefined
          ? numero_registre_commerce
          : oldClient.numero_registre_commerce,
      nif: nif !== undefined ? nif : oldClient.nif,
      conserne: conserne !== undefined ? conserne : oldClient.conserne,
    });

    // ✅ Si le conserne a changé, mettre à jour les associations de types de documents
    if (conserne && conserne !== oldClient.conserne) {
      // Supprimer toutes les associations existantes
      await oldClient.setTypes_document([]);

      // Ajouter les nouveaux types de documents correspondant au nouveau conserne
      const typesDocumentAssocies = await TypeDocument.findAll({
        where: {
          conserne: conserne,
        },
        attributes: ["id"],
      });

      if (typesDocumentAssocies.length > 0) {
        const typeIds = typesDocumentAssocies.map((t) => t.id);
        await oldClient.addTypes_document(typeIds);

        logger.info("🔗 Mise à jour des associations de types de documents", {
          clientId: id,
          oldConserne: oldClient.conserne,
          newConserne: conserne,
          typesCount: typeIds.length,
          userId: req.user?.id,
        });
      }
    }

    const updatedClient = await Client.findByPk(id, {
      include: [
        {
          model: Agent,
          as: "createur",
          attributes: ["id", "nom", "prenom"],
          required: false,
        },
        {
          model: TypeDocument,
          as: "types_document",
          attributes: ["id", "code", "nom", "conserne"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    logger.info("✅ Client mis à jour avec succès", {
      clientId: id,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logUpdate(req, "client", oldCopy, updatedClient);

    res.json({
      success: true,
      message: "Client mis à jour avec succès",
      data: updatedClient,
    });
  } catch (err) {
    logger.error("❌ Erreur mise à jour client:", {
      clientId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du client",
      error: err.message,
    });
  }
};

exports.remove = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un client", {
      clientId: id,
      userId: req.user?.id,
    });

    const client = await Client.findByPk(id);
    if (!client) {
      logger.warn("⚠️ Client non trouvé pour suppression", {
        clientId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    // ✅ Option 1: Supprimer d'abord les associations
    const linkedTypes = await client.countTypes_document();
    if (linkedTypes > 0) {
      logger.info(
        `🔗 Suppression de ${linkedTypes} associations de types de documents`,
        {
          clientId: id,
          linkedTypesCount: linkedTypes,
          userId: req.user?.id,
        },
      );

      // Supprimer les associations dans la table pivot
      await client.setTypes_document([]);
    }

    // ✅ Option 2: Supprimer également les documents associés (si nécessaire)
    // await Document.destroy({ where: { client_id: id } });

    // ✅ Option 3: Supprimer également les comptes associés (si nécessaire)
    // await Compte.destroy({ where: { client_id: id } });

    // Supprimer le client
    await client.destroy();

    logger.info("✅ Client supprimé avec succès", {
      clientId: id,
      nom: client.raison_sociale || `${client.prenom} ${client.nom}`,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    await HistoriqueService.logDelete(req, "client", client);

    res.json({
      success: true,
      message: "Client supprimé avec succès",
    });
  } catch (err) {
    logger.error("❌ Erreur suppression client:", {
      clientId: id,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du client",
      error: err.message,
    });
  }
};

exports.getTypesDocumentByClient = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await Client.findByPk(id, {
      include: [
        {
          model: TypeDocument,
          as: "types_document",
          attributes: ["id", "code", "nom", "conserne"],
          through: { attributes: [] }, // ← Ignorer les colonnes de la table pivot
        },
      ],
    });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client non trouvé" });
    }

    res.json({
      success: true,
      data: client.types_document,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
