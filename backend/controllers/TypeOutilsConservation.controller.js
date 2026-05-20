const { TypeOutilsConservation } = require("../models");

// Controller methods for TypeOutilsConservation
exports.getAllTypeOutilsConservation = async (req, res) => {
  try {
    const typeOutilsConservation = await TypeOutilsConservation.findAll();
    res.status(200).json(typeOutilsConservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTypeOutilsConservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const typeOutilsConservation = await TypeOutilsConservation.findByPk(id);
    if (!typeOutilsConservation) {
      return res
        .status(404)
        .json({ message: "Type d'outil de conservation non trouvé" });
    }
    res.status(200).json(typeOutilsConservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTypeOutilsConservation = async (req, res) => {
  try {
    const { nom } = req.body; // ✅ Changé de libelle à nom (correspond au modèle)
    console.log("📥 Création type outil conservation:", { nom });

    const newTypeOutilsConservation = await TypeOutilsConservation.create({
      nom,
    }); // ✅ Utilise 'nom'
    res.status(201).json(newTypeOutilsConservation);
  } catch (error) {
    console.error("❌ Erreur création:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTypeOutilsConservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom } = req.body; // ✅ Changé de libelle à nom
    const [updated] = await TypeOutilsConservation.update(
      { nom }, // ✅ Utilise 'nom'
      { where: { id } },
    );
    if (!updated) {
      return res
        .status(404)
        .json({ message: "Type d'outil de conservation non trouvé" });
    }
    const updatedTypeOutilsConservation =
      await TypeOutilsConservation.findByPk(id);
    res.status(200).json(updatedTypeOutilsConservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTypeOutilsConservation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TypeOutilsConservation.destroy({ where: { id } });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Type d'outil de conservation non trouvé" });
    }
    res.status(200).json({ message: "Type d'outil de conservation supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
