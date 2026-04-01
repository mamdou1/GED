// backend/models/PieceJointe.model.js
module.exports = (sequelize, DataTypes) => {
  const PieceJointe = sequelize.define(
    "PieceJointe",
    {
      idpiece_jointe: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom_fichier: DataTypes.STRING,
      fichier_url: DataTypes.STRING,
      date_ajout: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      courrier_idcourrier: DataTypes.INTEGER,
      agent_id: DataTypes.INTEGER,
    },
    {
      tableName: "piece_jointe",
      underscored: true,
      timestamps: true,
    }
  );

  PieceJointe.associate = (models) => {
    PieceJointe.belongsTo(models.Courrier, { foreignKey: "courrier_idcourrier", as: "courrier" });
    PieceJointe.belongsTo(models.Agent, { foreignKey: "agent_id", as: "agent" });
  };

  return PieceJointe;
};