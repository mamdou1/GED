// models/DocumentEntity.js
module.exports = (sequelize, DataTypes) => {
  const DocumentEntity = sequelize.define(
    "DocumentEntity",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      entity_type: {
        type: DataTypes.ENUM("entitee_un", "entitee_deux", "entitee_trois"),
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "document_entities",
      timestamps: true,
      underscored: true,
    },
  );

  DocumentEntity.associate = (models) => {
    // Relation vers Document
    DocumentEntity.belongsTo(models.Document, {
      foreignKey: "document_id",
      as: "document",
    });

    // Relations polymorphes vers les entités
    DocumentEntity.belongsTo(models.EntiteeUn, {
      foreignKey: "entity_id",
      constraints: false,
      as: "entitee_un",
    });

    DocumentEntity.belongsTo(models.EntiteeDeux, {
      foreignKey: "entity_id",
      constraints: false,
      as: "entitee_deux",
    });

    DocumentEntity.belongsTo(models.EntiteeTrois, {
      foreignKey: "entity_id",
      constraints: false,
      as: "entitee_trois",
    });
  };

  return DocumentEntity;
};