// backend/models/AuditCourrier.model.js
module.exports = (sequelize, DataTypes) => {
  const AuditCourrier = sequelize.define(
    "AuditCourrier",
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
      agent_id: DataTypes.INTEGER,
      action: DataTypes.STRING,
      details: DataTypes.TEXT,
      date_action: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "audit_courrier",
      underscored: true,
      timestamps: true,
    }
  );

  AuditCourrier.associate = (models) => {
    AuditCourrier.belongsTo(models.Courrier, {
      foreignKey: "courrier_id",
      as: "courrier",
    });
    AuditCourrier.belongsTo(models.Agent, {
      foreignKey: "agent_id",
      as: "agent",
    });
  };

  return AuditCourrier;
};