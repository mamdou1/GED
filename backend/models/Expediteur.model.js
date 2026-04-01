// backend/models/Expediteur.model.js
module.exports = (sequelize, DataTypes) => {
  const Expediteur = sequelize.define(
    "Expediteur",
    {
      idexpediteur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: DataTypes.STRING,
      nom: DataTypes.STRING,
      prenom: DataTypes.STRING,
      raison_sociale: DataTypes.STRING,
      email: DataTypes.STRING,
      telephone: DataTypes.STRING,
      adresse: DataTypes.TEXT,
    },
    {
      tableName: "expediteur",
      underscored: true,
      timestamps: true,
    }
  );

  // Pas d'associations complexes pour l'instant (tu pourras en ajouter plus tard)
  Expediteur.associate = () => {};

  return Expediteur;
};