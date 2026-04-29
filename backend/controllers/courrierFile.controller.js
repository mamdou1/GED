// backend/controllers/courrierFile.controller.js
const db = require("../models");
const fs = require("fs");
const path = require("path");

const PieceJointe = db.PieceJointe;
const Courrier = db.Courrier;
const Audit = db.Audit;

// Upload de fichiers pour un courrier
exports.uploadCourrierFiles = async (req, res) => {
  try {
    const { courrierId } = req.params;
    const files = req.files;
    const agentId = req.user?.id || null;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    // Vérifier si le courrier existe
    const courrier = await Courrier.findByPk(courrierId);
    if (!courrier) {
      return res.status(404).json({ message: "Courrier non trouvé" });
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Créer l'enregistrement en base de données
      const pieceJointe = await PieceJointe.create({
        nom_fichier: file.originalname,
        fichier_url: `/uploads/courriers/${file.filename}`,
        date_ajout: new Date(),
        courrier_idcourrier: courrierId,
        agent_id: agentId,
      });

      uploadedFiles.push(pieceJointe);

      // Journaliser l'action dans l'audit
      if (Audit) {
        await Audit.create({
          courrier_idcourrier: courrierId,
          action: "AJOUT_PIECE_JOINTE",
          details: `Ajout de la pièce jointe: ${file.originalname}`,
          agent_id: agentId,
          created_at: new Date(),
        });
      }
    }

    res.status(201).json({
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Erreur upload fichiers:", error);
    res.status(500).json({ message: "Erreur lors de l'upload des fichiers", error: error.message });
  }
};

// Récupérer tous les fichiers d'un courrier
exports.getCourrierFiles = async (req, res) => {
  try {
    const { courrierId } = req.params;

    const piecesJointes = await PieceJointe.findAll({
      where: { courrier_idcourrier: courrierId },
      order: [["date_ajout", "DESC"]],
    });

    res.status(200).json(piecesJointes);
  } catch (error) {
    console.error("Erreur récupération fichiers:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des fichiers", error: error.message });
  }
};

// Supprimer un fichier
exports.deleteCourrierFile = async (req, res) => {
  try {
    const { courrierId, fileId } = req.params;

    const pieceJointe = await PieceJointe.findOne({
      where: { idpiece_jointe: fileId, courrier_idcourrier: courrierId },
    });

    if (!pieceJointe) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }

    // Supprimer le fichier physique
    const filePath = path.join(__dirname, "..", pieceJointe.fichier_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer l'enregistrement en base
    await pieceJointe.destroy();

    // Journaliser l'action
    if (Audit) {
      await Audit.create({
        courrier_idcourrier: courrierId,
        action: "SUPPRESSION_PIECE_JOINTE",
        details: `Suppression de la pièce jointe: ${pieceJointe.nom_fichier}`,
        agent_id: req.user?.id || null,
        created_at: new Date(),
      });
    }

    res.status(200).json({ message: "Fichier supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression fichier:", error);
    res.status(500).json({ message: "Erreur lors de la suppression du fichier", error: error.message });
  }
};

// Télécharger un fichier
exports.downloadCourrierFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const pieceJointe = await PieceJointe.findByPk(fileId);

    if (!pieceJointe) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }

    const filePath = path.join(__dirname, "..", pieceJointe.fichier_url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier physique non trouvé" });
    }

    res.download(filePath, pieceJointe.nom_fichier);
  } catch (error) {
    console.error("Erreur téléchargement fichier:", error);
    res.status(500).json({ message: "Erreur lors du téléchargement du fichier", error: error.message });
  }
};