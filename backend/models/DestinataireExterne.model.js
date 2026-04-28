// backend/models/DestinataireExterne.model.js
module.exports = (sequelize, DataTypes) => {
  const DestinataireExterne = sequelize.define(
    "DestinataireExterne",
    {
      iddestinataire_externe: {
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
      tableName: "destinataire_externe",
      underscored: true,
      timestamps: true,
    }
  );

  DestinataireExterne.associate = () => {};

  return DestinataireExterne;
};