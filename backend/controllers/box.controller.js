// controllers/box.controller.js
const {
  Box,
  Document,
  Trave,
  TypeDocument,
  EntiteeUn,
  EntiteeDeux,
  EntiteeTrois,
  sequelize,
  TypeOutilsConservation,
} = require("../models");
const logger = require("../config/logger.config");
const HistoriqueService = require("../services/historique.service");
const BoxModel = require("../models/Box.model");

// --- Méthodes de gestion de Box ---

exports.create = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("📦 Tentative de création d'un box", {
      userId: req.user?.id,
      body: req.body,
    });

    const data = await Box.create({
      ...req.body,
      current_count: 0,
    });

    logger.info("✅ Box créé avec succès", {
      boxId: data.id,
      code: data.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "box", data);

    res.status(201).json(data);
  } catch (error) {
    logger.error("❌ Erreur création box", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.status(500).json({
      message: "Erreur lors de la création du box",
      error: error.message,
    });
  }
};

exports.findAll = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.debug("🔍 Récupération de tous les boxes", {
      userId: req.user?.id,
      query: req.query,
    });

    const data = await Box.findAll({
      include: [
        {
          model: Trave,
          as: "trave",
        },
        {
          model: TypeDocument,
          as: "typeDocument",
        },
        {
          model: EntiteeUn,
          as: "entitee_un",
        },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
        },
        {
          model: TypeOutilsConservation,
          as: "typeOutilsConservation",
        },
      ],
    });

    logger.info("✅ Boxes récupérés", {
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // ✅ Journalisation dans l'historique pour les GET avec sidebar
    if (req.headers["x-sidebar-navigation"] === "true") {
      await HistoriqueService.log({
        agent_id: req.user?.id || null,
        action: "read",
        resource: "box",
        resource_id: null,
        resource_identifier: "liste des boxes",
        description: "Consultation de la liste des boxes",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          count: data.length,
          duration: Date.now() - startTime,
        },
      });
    }

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur récupération boxes", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.status(500).json({
      message: "Erreur lors de la récupération des box",
      error: error.message,
    });
  }
};

exports.findById = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Recherche d'un box par ID", {
      boxId: id,
      userId: req.user?.id,
    });

    const data = await Box.findByPk(id, {
      include: [
        {
          model: Document,
          as: "documents",
        },
        {
          model: Trave,
          as: "trave",
        },
        {
          model: TypeDocument,
          as: "typeDocument",
        },
        {
          model: EntiteeUn,
          as: "entitee_un",
        },
        {
          model: EntiteeDeux,
          as: "entitee_deux",
        },
        {
          model: EntiteeTrois,
          as: "entitee_trois",
        },
        {
          model: TypeOutilsConservation,
          as: "typeOutilsConservation",
        },
      ],
    });

    if (!data) {
      logger.warn("⚠️ Box non trouvé", {
        boxId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Box non trouvé" });
    }

    logger.info("✅ Box trouvé", {
      boxId: id,
      code: data.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // ✅ Journalisation dans l'historique pour la consultation d'un box spécifique
    await HistoriqueService.log({
      agent_id: req.user?.id || null,
      action: "read",
      resource: "box",
      resource_id: data.id,
      resource_identifier: `${data.code || data.libelle} (${data.id})`,
      description: `Consultation du box #${data.id}`,
      method: req.method,
      path: req.originalUrl,
      status: 200,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
      data: {
        duration: Date.now() - startTime,
        params: req.params,
      },
    });

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur recherche box", {
      boxId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.status(500).json({
      message: "Erreur lors de la récupération du box",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("📝 Tentative de modification d'un box", {
      boxId: id,
      userId: req.user?.id,
      body: req.body,
    });

    // Récupérer l'ancienne version pour l'historique
    const oldBox = await Box.findByPk(id);

    const { current_count, ...updateData } = req.body;
    const [updated] = await Box.update(updateData, {
      where: { id },
    });

    if (updated === 0) {
      logger.warn("⚠️ Box non trouvé ou aucune modification", {
        boxId: id,
        userId: req.user?.id,
      });
      return res
        .status(404)
        .json({ message: "Box non trouvé ou aucune modification" });
    }

    // Récupérer le box mis à jour avec toutes ses associations
    const updatedBox = await Box.findByPk(id, {
      include: [
        { model: Trave, as: "trave" },
        { model: TypeDocument, as: "typeDocument" },
        { model: EntiteeUn, as: "entitee_un" },
        { model: EntiteeDeux, as: "entitee_deux" },
        { model: EntiteeTrois, as: "entitee_trois" },
        { model: TypeOutilsConservation, as: "typeOutilsConservation" },
      ],
    });

    logger.info("✅ Box modifié avec succès", {
      boxId: id,
      code: updatedBox.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logUpdate(req, "box", oldBox, updatedBox);

    res.json({ success: true, message: "Box mis à jour", data: updatedBox });
  } catch (error) {
    logger.error("❌ Erreur modification box", {
      boxId: id,
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};

exports.delete = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.info("🗑️ Tentative de suppression d'un box", {
      boxId: id,
      userId: req.user?.id,
    });

    const box = await Box.findByPk(id);
    if (!box) {
      logger.warn("⚠️ Box non trouvé pour suppression", {
        boxId: id,
        userId: req.user?.id,
      });
      return res.status(404).json({ message: "Box non trouvé" });
    }

    if (box.current_count > 0) {
      logger.warn("⛔ Tentative de suppression d'un box non vide", {
        boxId: id,
        current_count: box.current_count,
        userId: req.user?.id,
      });
      return res.status(400).json({
        message: "Impossible de supprimer un box contenant des documents",
      });
    }

    await Box.destroy({ where: { id } });

    logger.info("✅ Box supprimé avec succès", {
      boxId: id,
      code: box.code,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    // Journalisation dans l'historique
    await HistoriqueService.logDelete(req, "box", box);

    res.json({ success: true, message: "Box supprimé" });
  } catch (error) {
    logger.error("❌ Erreur suppression box", {
      boxId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res
      .status(500)
      .json({ message: "Erreur lors de la suppression", error: error.message });
  }
};

// --- Logique d'archivage (Ajout/Retrait) ---

exports.addDocumentToBox = async (req, res) => {
  const startTime = Date.now();
  const { boxId, documentId } = req.params;

  try {
    logger.info("📥 Tentative d'ajout de document dans box", {
      boxId,
      documentId,
      userId: req.user?.id,
    });

    const box = await Box.findByPk(boxId);
    const doc = await Document.findByPk(documentId);

    if (!box || !doc) {
      return res.status(404).json({ message: "Box ou Document introuvable" });
    }

    // Vérification Capacité
    if (box.current_count >= box.capacite_max) {
      return res
        .status(400)
        .json({ message: "Capacité maximale atteinte pour ce box" });
    }

    // Vérification Type
    if (box.type_document_id && box.type_document_id !== doc.type_document_id) {
      return res
        .status(400)
        .json({ message: "Le type de document ne correspond pas à ce box" });
    }

    // Mise à jour
    if (!box.type_document_id) box.type_document_id = doc.type_document_id;
    box.current_count += 1;
    doc.box_id = box.id;

    // 🔹 Mise à jour du status
    if (box.current_count === 0) {
      box.status = "LIBRE";
    } else if (box.current_count >= box.capacite_max) {
      box.status = "PLIEN";
    } else if (box.current_count >= 1) {
      box.status = "OCCUPE";
    }

    await box.save();
    await doc.save();

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "box", box);

    res.json({
      success: true,
      current_count: box.current_count,
      status: box.status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout du document",
      error: error.message,
    });
  }
};

exports.retireDocumentToBox = async (req, res) => {
  const startTime = Date.now();
  const { documentId } = req.params;

  try {
    const doc = await Document.findByPk(documentId);
    if (!doc || !doc.box_id) {
      return res
        .status(404)
        .json({ message: "Document non trouvé ou déjà hors box" });
    }

    const box = await Box.findByPk(doc.box_id);
    if (box) {
      box.current_count = Math.max(0, box.current_count - 1);
      if (box.current_count === 0) {
        box.type_document_id = null;
        box.status = "LIBRE";
      } else if (box.current_count >= box.capacite_max) {
        box.status = "PLIEN";
      } else {
        box.status = "OCCUPE";
      }
      await box.save();
    }

    doc.box_id = null;
    await doc.save();

    // Journalisation dans l'historique
    await HistoriqueService.logCreate(req, "box", box);

    res.json({
      success: true,
      message: "Document retiré avec succès",
      status: box?.status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du retrait du document",
      error: error.message,
    });
  }
};

exports.moveDocumentToBox = async (req, res) => {
  const { sourceBoxId, documentId } = req.params;
  const { destinationBoxId } = req.body;

  const t = await sequelize.transaction();

  try {
    logger.info("🔄 Déplacement de document initié", {
      documentId,
      sourceBoxId,
      destinationBoxId,
    });

    // 1. Récupération du document
    const doc = await Document.findByPk(documentId, { transaction: t });
    if (!doc) {
      await t.rollback();
      return res.status(404).json({ message: "Document introuvable" });
    }

    // 2. Mise à jour du Box Source
    const sourceBox = await Box.findByPk(sourceBoxId, { transaction: t });
    if (sourceBox) {
      sourceBox.current_count = Math.max(0, sourceBox.current_count - 1);
      if (sourceBox.current_count === 0) {
        sourceBox.type_document_id = null;
        sourceBox.status = "LIBRE";
      } else {
        sourceBox.status = "OCCUPE";
      }
      await sourceBox.save({ transaction: t });
    }

    // 3. Récupération et préparation du Box Destination
    const destBox = await Box.findByPk(destinationBoxId, { transaction: t });
    if (!destBox) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Box de destination introuvable" });
    }

    // --- CAPTURE DE L'ANCIEN ÉTAT (pour le log) ---
    const oldBoxData = destBox.toJSON();

    // Vérifications de sécurité
    if (destBox.current_count >= destBox.capacite_max) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Le box de destination est plein" });
    }

    if (
      destBox.type_document_id &&
      destBox.type_document_id !== doc.type_document_id
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Incompatibilité de type de document" });
    }

    // 4. Mise à jour effective du Box Destination
    if (!destBox.type_document_id)
      destBox.type_document_id = doc.type_document_id;
    destBox.current_count += 1;
    destBox.status =
      destBox.current_count >= destBox.capacite_max ? "PLEIN" : "OCCUPE";

    await destBox.save({ transaction: t });

    // 5. Liaison du document
    doc.box_id = destBox.id;
    await doc.save({ transaction: t });

    // Validation de la transaction
    await t.commit();

    // --- LOG HISTORIQUE (Après commit pour sécurité) ---
    // On passe destBox.toJSON() pour éviter les références circulaires de Sequelize
    try {
      await HistoriqueService.logUpdate(
        req,
        "box",
        oldBoxData,
        destBox.toJSON(),
      );
    } catch (logError) {
      logger.error(
        "⚠️ Erreur lors de l'enregistrement de l'historique",
        logError.message,
      );
      // On ne bloque pas la réponse si seul le log échoue
    }

    return res.json({
      success: true,
      message: "Transfert réussi",
      data: {
        documentId: doc.id,
        sourceBoxStatus: sourceBox?.status,
        destBoxStatus: destBox.status,
      },
    });
  } catch (error) {
    // Vérification si la transaction peut encore être annulée
    if (t && !t.finished) await t.rollback();

    logger.error("❌ Erreur transfert document", { error: error.message });
    return res.status(500).json({
      message: "Erreur lors du déplacement",
      error: error.message,
    });
  }
};

exports.getAllDocumentByBox = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  try {
    logger.debug("🔍 Récupération des documents d'un box", {
      boxId: id,
      userId: req.user?.id,
    });

    const data = await Document.findAll({
      where: { box_id: id },
      include: [
        {
          model: TypeDocument,
          as: "typeDocument",
        },
      ],
    });

    logger.info("✅ Documents du box récupérés", {
      documentId: data.map((doc) => doc.id),
      boxId: id,
      count: data.length,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.json(data);
  } catch (error) {
    logger.error("❌ Erreur récupération documents du box", {
      boxId: id,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: Date.now() - startTime,
    });

    res.status(500).json({
      message: "Erreur lors de la récupération des documents",
      error: error.message,
    });
  }
};
