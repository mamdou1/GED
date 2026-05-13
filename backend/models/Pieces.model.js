module.exports = (sequelize, DataTypes) => {
  const Pieces = sequelize.define(
    "Pieces",
    {
      code_pieces: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      libelle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "pieces",
      timestamps: true,
      underscored: true,
    },
  );
  Pieces.associate = (models) => {
    Pieces.belongsToMany(models.TypeDocument, {
      through: models.TypeDocumentPieces,
      foreignKey: "piece_id",
      otherKey: "document_type_id",
      as: "typesDocument",
    });

    Pieces.belongsToMany(models.Document, {
      through: models.DocumentPieces,
      foreignKey: "piece_id",
      otherKey: "document_id",
      as: "document",
    });
    Pieces.hasMany(models.DocumentFichier, {
      foreignKey: "piece_id",
      as: "documentFichiers",
    });
    Pieces.hasMany(models.PieceMetaField, {
      foreignKey: "piece_id",
      as: "metaFields",
    });

    Pieces.hasMany(models.EntityTypeDocumentPiece, {
      foreignKey: "piece_id",
      as: "entityOverrides",
    });
  };

  return Pieces;
};
