// models/division.js
module.exports = (sequelize, DataTypes) => {
  const EntiteeDeux = sequelize.define(
    "EntiteeDeux",
    {
      titre: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      libelle: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "entitee_deux", underscored: true },
  );

  EntiteeDeux.associate = (models) => {
    EntiteeDeux.belongsTo(models.EntiteeUn, {
      foreignKey: "entitee_un_id",
      as: "entitee_un",
    });
    EntiteeDeux.hasMany(models.EntiteeTrois, {
      foreignKey: "entitee_deux_id",
      as: "entitee_trois",
    });
    EntiteeDeux.hasMany(models.Fonction, {
      foreignKey: "entitee_deux_id",
      as: "fonctions",
    });
    EntiteeDeux.belongsToMany(models.TypeDocument, {
      through: "entitee_deux_type_documents",
      foreignKey: "entitee_deux_id",
      otherKey: "type_document_id",
      as: "typeDocuments",
    });
    // Division.belongsTo(models.Type, {
    //   foreignKey: "piece_id",
    //   as: "types",
    // });
  };
  return EntiteeDeux;
};
