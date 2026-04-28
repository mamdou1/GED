const { Expediteur } = require("../models");

class ExpediteurService {
  static async getAll() {
    return await Expediteur.findAll({ order: [["nom", "ASC"]] });
  }

  static async getById(id) {
    const expediteur = await Expediteur.findByPk(id);
    if (!expediteur) throw new Error("Expéditeur non trouvé");
    return expediteur;
  }

  static async create(data) {
    return await Expediteur.create(data);
  }

  static async update(id, data) {
    const expediteur = await this.getById(id);
    await expediteur.update(data);
    return expediteur;
  }

  static async delete(id) {
    const expediteur = await this.getById(id);
    await expediteur.destroy();
    return true;
  }
}

module.exports = ExpediteurService;