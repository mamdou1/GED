// models/fonction.js
module.exports = (sequelize, DataTypes) => {
  const Fonction = sequelize.define(
    "Fonction",
    {
      libelle: { type: DataTypes.STRING, allowNull: false },
      entitee_un_id: { type: DataTypes.INTEGER, allowNull: true },
      entitee_deux_id: { type: DataTypes.INTEGER, allowNull: true },
      entitee_trois_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: "fonctions", underscored: true },
  );

  Fonction.associate = (models) => {
    Fonction.hasMany(models.Agent, { foreignKey: "fonction_id", as: "agents" });
    Fonction.belongsTo(models.EntiteeUn, {
      foreignKey: "entitee_un_id",
      as: "entitee_un",
    });
    Fonction.belongsTo(models.EntiteeDeux, {
      foreignKey: "entitee_deux_id",
      as: "entitee_deux",
    });
    Fonction.belongsTo(models.EntiteeTrois, {
      foreignKey: "entitee_trois_id",
      as: "entitee_trois",
    });
  };
  return Fonction;
};
