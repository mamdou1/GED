module.exports = (sequelize, DataTypes) => {
  const AttributionCourrier = sequelize.define(
    "AttributionCourrier",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      courrier_id: { type: DataTypes.INTEGER, allowNull: false },
      attribue_par_agent_id: { type: DataTypes.INTEGER, allowNull: false },
      attribue_a_agent_id: DataTypes.INTEGER,
      attribue_a_entitee_id: DataTypes.INTEGER,
      delai_heures_applique: DataTypes.INTEGER,
      date_limite_traitement: DataTypes.DATE,
      instructions_copiees: DataTypes.TEXT,
      commentaire: DataTypes.TEXT,
      date_attribution: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      est_transfert: { type: DataTypes.BOOLEAN, defaultValue: false },
      // Ajoute ces champs fantômes pour que Sequelice les ignore
      attribue_par_id: { type: DataTypes.VIRTUAL },
      attribue_a_id: { type: DataTypes.VIRTUAL },
    },
    { tableName: "attribution_courrier", underscored: true, timestamps: true }
  );

  AttributionCourrier.associate = (models) => {
    AttributionCourrier.belongsTo(models.Courrier, { foreignKey: "courrier_id", as: "courrier" });
    AttributionCourrier.belongsTo(models.Agent, { foreignKey: "attribue_par_agent_id", as: "attribue_par" });
    AttributionCourrier.belongsTo(models.Agent, { foreignKey: "attribue_a_agent_id", as: "attribue_a" });
    AttributionCourrier.belongsTo(models.EntiteeDeux, { foreignKey: "attribue_a_entitee_id", as: "entitee" });
  };

  return AttributionCourrier;
};