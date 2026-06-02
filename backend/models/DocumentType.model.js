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
      nom: DataTypes.TEXT,
      conserne: {
        type: DataTypes.ENUM("Personne physique", "Personne morale"),
        allowNull: true, // facultatif
      },
      type_compte_id: {
        // ✅ NOUVEAU : lien avec TypeCompte
        type: DataTypes.INTEGER,
        allowNull: true,
      },
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

    TypeDocument.belongsToMany(models.EntiteeUn, {
      through: "entitee_un_type_documents",
      foreignKey: "type_document_id",
      otherKey: "entitee_un_id",
      as: "entitee_un",
    });
    TypeDocument.belongsToMany(models.EntiteeDeux, {
      through: "entitee_deux_type_documents",
      foreignKey: "type_document_id",
      otherKey: "entitee_deux_id",
      as: "entitee_deux",
    });
    TypeDocument.belongsToMany(models.EntiteeTrois, {
      through: "entitee_trois_type_documents",
      foreignKey: "type_document_id",
      otherKey: "entitee_trois_id",
      as: "entitee_trois",
    });

    TypeDocument.belongsToMany(models.Client, {
      through: "client_type_documents",
      foreignKey: "type_document_id",
      otherKey: "client_id",
      as: "clients",
    });

    TypeDocument.hasMany(models.EntityTypeDocumentPiece, {
      foreignKey: "type_document_id",
      as: "entityPieceOverrides",
    });

    TypeDocument.belongsTo(models.TypeCompte, {
      foreignKey: "type_compte_id",
      as: "type_compte",
    });

    // TypeDocument.belongsTo(models.EntiteeUn, {
    //   foreignKey: "entitee_un_id",
    //   as: "entitee_un",
    // });
    // TypeDocument.belongsTo(models.EntiteeDeux, {
    //   foreignKey: "entitee_deux_id",
    //   as: "entitee_deux",
    // });
    // TypeDocument.belongsTo(models.EntiteeTrois, {
    //   foreignKey: "entitee_trois_id",
    //   as: "entitee_trois",
    // });
  };

  return TypeDocument;
};
