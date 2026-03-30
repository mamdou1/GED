module.exports = (sequelize, DataTypes) => {
  const TypeDocument = sequelize.define(
    "TypeDocument",
    {
      id: {
        // ✅ AJOUTEZ CETTE LIGNE - Définir une clé primaire
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: DataTypes.STRING,
      cote: DataTypes.STRING,
      nom: DataTypes.STRING,
      entitee_un_id: { type: DataTypes.INTEGER, allowNull: true },
      entitee_deux_id: { type: DataTypes.INTEGER, allowNull: true },
      entitee_trois_id: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "typedocuments", // 👈 correspond exactement au nom réel de la table timestamps: false,
      timestamps: true,
      underscored: true,
    },
  );

  TypeDocument.associate = (models) => {
    TypeDocument.hasMany(models.MetaField, {
      foreignKey: "type_document_id",
      as: "metaFields",
    });
    TypeDocument.hasMany(models.Document, {
      foreignKey: "type_document_id",
      as: "documents",
    });

    TypeDocument.belongsToMany(models.Pieces, {
      through: models.TypeDocumentPieces,
      foreignKey: "document_type_id",
      otherKey: "piece_id",
      as: "pieces",
    });

    TypeDocument.belongsTo(models.EntiteeUn, {
      foreignKey: "entitee_un_id",
      as: "entitee_un",
    });
    TypeDocument.belongsTo(models.EntiteeDeux, {
      foreignKey: "entitee_deux_id",
      as: "entitee_deux",
    });
    TypeDocument.belongsTo(models.EntiteeTrois, {
      foreignKey: "entitee_trois_id",
      as: "entitee_trois",
    });
  };

  return TypeDocument;
};
