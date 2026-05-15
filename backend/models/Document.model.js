// models/Document.js
module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define(
    "Document",
    {
      box_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type_document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      agent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    { tableName: "documents", timestamps: true, underscored: true },
  );

  Document.associate = (models) => {
    Document.belongsTo(models.TypeDocument, {
      foreignKey: "type_document_id",
      as: "typeDocument",
    });
    
    Document.hasMany(models.DocumentValue, {
      foreignKey: "document_id",
      as: "values",
    });
    
    Document.belongsTo(models.Box, {
      foreignKey: "box_id",
      as: "box",
    });

    Document.belongsToMany(models.Pieces, {
      through: models.DocumentPieces,
      foreignKey: "document_id",
      otherKey: "piece_id",
      as: "pieces",
    });

    Document.belongsTo(models.Agent, {
      foreignKey: "agent_id",
      as: "agent",
    });
  };

  return Document;
};