// models/EntityCustomFieldValue.js
module.exports = (sequelize, DataTypes) => {
  const EntityCustomFieldValue = sequelize.define(
    "EntityCustomFieldValue",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      entity_custom_field_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "entity_custom_field_values",
      timestamps: true,
      underscored: true,
    }
  );

  EntityCustomFieldValue.associate = (models) => {
    EntityCustomFieldValue.belongsTo(models.EntityCustomField, {
      foreignKey: "entity_custom_field_id",
      as: "customField",
    });
    EntityCustomFieldValue.belongsTo(models.Document, {
      foreignKey: "document_id",
      as: "document",
    });
  };

  return EntityCustomFieldValue;
};