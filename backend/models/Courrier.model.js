const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Courrier = sequelize.define(
    "Courrier",
    {
      idcourrier: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      reference: { type: DataTypes.STRING, unique: true, allowNull: false },
      type: { type: DataTypes.ENUM("ARRIVE", "DEPART"), allowNull: false, defaultValue: "ARRIVE" },
      nature: DataTypes.STRING,
      type_support: DataTypes.STRING,
      objet: { type: DataTypes.STRING, allowNull: false },
      corps: DataTypes.TEXT,
      expediteur: DataTypes.STRING,
      destinataire: DataTypes.STRING,

      expediteur_id: DataTypes.INTEGER,
      destinataire_idagent: DataTypes.INTEGER,
      destinataire_externe_id: DataTypes.INTEGER,
      
      // Attribution flexible à une entité (service, division, etc.)
      destinataire_entitee_id: DataTypes.INTEGER,
      destinataire_entitee_type: DataTypes.STRING,   // "EntiteeDeux", "EntiteeTrois", etc. (pour scalabilité)

      entitee_id: { type: DataTypes.INTEGER, allowNull: false, comment: "Direction principale" },

      statut: {
        type: DataTypes.ENUM("EN_ATTENTE", "VALIDE", "REJETE", "ATTRIBUE", "EN_COURS", "TRAITE", "ARCHIVE", "RENVOYE"),
        defaultValue: "EN_ATTENTE",
      },

      date_reception: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      date_limite_traitement: DataTypes.DATE,
      date_attribution: DataTypes.DATE,
      date_traitement: DataTypes.DATE,
      date_modification: DataTypes.DATE,

      agent_id: { type: DataTypes.INTEGER, allowNull: false },
      attribue_par_agent_id: DataTypes.INTEGER,
      traite_par_agent_id: DataTypes.INTEGER,
      modifie_par_agent_id: DataTypes.INTEGER,
      motif_traitement: DataTypes.TEXT,
    },
    {
      tableName: "courrier",
      underscored: true,
      timestamps: true,
      createdAt: "date_creation",
      updatedAt: "date_modification",
      hooks: {
        beforeCreate: async (courrier, options) => {
          if (!courrier.reference) {
            const prefix = courrier.type === "ARRIVE" ? "AR" : "DP";
            const annee = new Date().getFullYear();
            const lastCourrier = await Courrier.findOne({
              where: { type: courrier.type, reference: { [Op.like]: `${prefix}-${annee}-%` } },
              order: [["reference", "DESC"]],
              transaction: options.transaction,
            });
            let sequence = 1;
            if (lastCourrier) {
              const lastNum = parseInt(lastCourrier.reference.split("-").pop(), 10);
              if (!isNaN(lastNum)) sequence = lastNum + 1;
            }
            courrier.reference = `${prefix}-${annee}-${String(sequence).padStart(4, "0")}`;
          }
        },
      },
    }
  );

  Courrier.associate = (models) => {
    Courrier.belongsTo(models.Agent, { foreignKey: "agent_id", as: "createur" });
    Courrier.belongsTo(models.Agent, { foreignKey: "destinataire_idagent", as: "destinataire_agent" });
    Courrier.belongsTo(models.Agent, { foreignKey: "attribue_par_agent_id", as: "attribue_par" });
    Courrier.belongsTo(models.Agent, { foreignKey: "traite_par_agent_id", as: "traite_par" });
    Courrier.belongsTo(models.Agent, { foreignKey: "modifie_par_agent_id", as: "modifie_par" });
    
    Courrier.belongsTo(models.EntiteeUn, { foreignKey: "entitee_id", as: "direction" });
    Courrier.belongsTo(models.EntiteeDeux, { foreignKey: "destinataire_entitee_id", as: "destinataire_entitee_deux" });
    Courrier.belongsTo(models.EntiteeTrois, { foreignKey: "destinataire_entitee_id", as: "destinataire_entitee_trois" });
    
    Courrier.belongsTo(models.Expediteur, { foreignKey: "expediteur_id", as: "expediteur_details" });
    Courrier.belongsTo(models.DestinataireExterne, { foreignKey: "destinataire_externe_id", as: "destinataire_externe" });
    
    Courrier.hasMany(models.PieceJointe, { foreignKey: "courrier_idcourrier", as: "pieces_jointes" });
    Courrier.hasMany(models.AttributionCourrier, { foreignKey: "courrier_id", as: "attributions" });
    Courrier.hasMany(models.TraitementCourrier, { foreignKey: "courrier_id", as: "historique_traitements" });
    Courrier.hasMany(models.AuditCourrier, { foreignKey: "courrier_id", as: "audit" });
  };

  return Courrier;
};