// backend/models/TraitementCourrier.model.js
module.exports = (sequelize, DataTypes) => {
  const TraitementCourrier = sequelize.define(
    "TraitementCourrier",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      courrier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attribution_id: DataTypes.INTEGER,
      agent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action: DataTypes.STRING,
      nouveau_statut: DataTypes.STRING,
      motif: DataTypes.TEXT,
      date_action: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "traitement_courrier",
      underscored: true,
      timestamps: true,
    }
  );

  TraitementCourrier.associate = (models) => {
    TraitementCourrier.belongsTo(models.Courrier, {
      foreignKey: "courrier_id",
      as: "courrier",
    });
    TraitementCourrier.belongsTo(models.AttributionCourrier, {
      foreignKey: "attribution_id",
      as: "attribution",
    });
    TraitementCourrier.belongsTo(models.Agent, {
      foreignKey: "agent_id",
      as: "agent",
    });
  };

  return TraitementCourrier;
};