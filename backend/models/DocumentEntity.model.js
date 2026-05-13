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
    DocumentEntity.belongsTo(models.Document, {
      foreignKey: "document_id",
      as: "document",
    });
  };

  return DocumentEntity;
};
