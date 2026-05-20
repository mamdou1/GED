module.exports = (sequelize, DataTypes) => {
  const Box = sequelize.define(
    "Box",
    {
      code_box: { type: DataTypes.STRING, allowNull: false },
      libelle: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM("OCCUPE", "LIBRE", "PLIEN", "RESERVER"),
        allowNull: false,
        defaultValue: "LIBRE",
      },
      type_outils_conservation_id: {
        // ✅ Ajout de ce champ
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      capacite_max: { type: DataTypes.INTEGER, allowNull: false },
      current_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      type_document_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "box",
      underscored: true,
      timestamps: true,
    },
  );

  Box.associate = (models) => {
    // Correction : Un box appartient à une TRAVÉE
    Box.belongsTo(models.Trave, { foreignKey: "trave_id", as: "trave" });
    Box.belongsTo(models.TypeDocument, {
      foreignKey: "type_document_id",
      as: "typeDocument",
    });
    Box.belongsTo(models.EntiteeUn, {
      foreignKey: "entitee_un_id",
      as: "entitee_un",
    });
    Box.belongsTo(models.EntiteeDeux, {
      foreignKey: "entitee_deux_id",
      as: "entitee_deux",
    });
    Box.belongsTo(models.EntiteeTrois, {
      foreignKey: "entitee_trois_id",
      as: "entitee_trois",
    });

    Box.hasMany(models.Document, { foreignKey: "box_id", as: "documents" });
    Box.belongsTo(models.TypeOutilsConservation, {
      foreignKey: "type_outils_conservation_id",
      as: "typeOutilsConservation",
    });
  };

  return Box;
};
