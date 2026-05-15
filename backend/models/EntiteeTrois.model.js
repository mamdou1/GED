// models/section.js
module.exports = (sequelize, DataTypes) => {
  const EntiteeTrois = sequelize.define(
    "EntiteeTrois",
    {
      titre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      libelle: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "entitee_trois", underscored: true },
  );

  EntiteeTrois.associate = (models) => {
    EntiteeTrois.belongsTo(models.EntiteeDeux, {
      foreignKey: "entitee_deux_id",
      as: "entitee_deux",
    });
    EntiteeTrois.hasMany(models.Fonction, {
      foreignKey: "entitee_trois_id",
      as: "fonctions",
    });
    EntiteeTrois.belongsToMany(models.TypeDocument, {
      through: "entitee_trois_type_documents",
      foreignKey: "entitee_trois_id",
      otherKey: "type_document_id",
      as: "typeDocuments",
    });
  };
  return EntiteeTrois;
};
