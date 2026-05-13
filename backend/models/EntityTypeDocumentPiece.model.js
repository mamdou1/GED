module.exports = (sequelize, DataTypes) => {
  const EntityTypeDocumentPiece = sequelize.define(
    "EntityTypeDocumentPiece",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      entity_type: {
        type: DataTypes.STRING,
        primaryKey: true,
      },

      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      type_document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      piece_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      action: {
        type: DataTypes.ENUM("ADD", "REMOVE"),
        allowNull: false,
      },
    },
    {
      tableName: "entity_type_document_pieces",
      timestamps: true,
      underscored: true,
    },
  );

  EntityTypeDocumentPiece.associate = (models) => {
    EntityTypeDocumentPiece.belongsTo(models.TypeDocument, {
      foreignKey: "type_document_id",
      as: "typeDocument",
    });

    EntityTypeDocumentPiece.belongsTo(models.Pieces, {
      foreignKey: "piece_id",
      as: "piece",
    });
  };

  return EntityTypeDocumentPiece;
};
