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
      capacite_max: { type: DataTypes.INTEGER, allowNull: false },
      current_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      type_document_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "box",
      underscored: true,
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
  };

  return Box;
};
