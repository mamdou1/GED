// models/EntiteeUn.js
module.exports = (sequelize, DataTypes) => {
  const EntiteeUn = sequelize.define(
    "EntiteeUn",
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
    { tableName: "entitee_un", underscored: true },
  );

  EntiteeUn.associate = (models) => {
    EntiteeUn.hasMany(models.EntiteeDeux, {
      foreignKey: "entitee_un_id",
      as: "entitee_deux",
    });
    EntiteeUn.hasMany(models.Fonction, {
      foreignKey: "entitee_un_id",
      as: "fonctions",
    });
    EntiteeUn.belongsToMany(models.TypeDocument, {
      through: "entitee_un_type_documents",
      foreignKey: "entitee_un_id",
      otherKey: "type_document_id",
      as: "typeDocuments",
    });
  };
  return EntiteeUn;
};
