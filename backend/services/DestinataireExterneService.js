const { DestinataireExterne } = require("../models");

class DestinataireExterneService {
  static async getAll() {
    return await DestinataireExterne.findAll({ order: [["nom", "ASC"]] });
  }

  static async getById(id) {
    const dest = await DestinataireExterne.findByPk(id);
    if (!dest) throw new Error("Destinataire externe non trouvé");
    return dest;
  }

  static async create(data) {
    return await DestinataireExterne.create(data);
  }

  static async update(id, data) {
    const dest = await this.getById(id);
    await dest.update(data);
    return dest;
  }

  static async delete(id) {
    const dest = await this.getById(id);
    await dest.destroy();
    return true;
  }
}

module.exports = DestinataireExterneService;