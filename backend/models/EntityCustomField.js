// models/EntityCustomField.js
module.exports = (sequelize, DataTypes) => {
  const EntityCustomField = sequelize.define(
    "EntityCustomField",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type_document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // 🔥 MODIFICATION : entity_type devient dynamique
      entity_type: {
        type: DataTypes.ENUM("EntiteeUn", "EntiteeDeux", "EntiteeTrois"),
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      field_type: {
        type: DataTypes.ENUM(
          "TEXT", "TEXTAREA", "NUMBER", "DATE", "BOOLEAN",
          "SELECT", "MULTISELECT", "RADIO", "CHECKBOX",
          "FILE", "EMAIL", "PHONE"
        ),
        allowNull: false,
      },
      required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      position: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      options: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      placeholder: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      default_value: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "entity_custom_fields",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["type_document_id", "entity_type", "entity_id", "name"],
          name: "unique_entity_field_per_entity",
        },
      ],
    }
  );

  EntityCustomField.associate = (models) => {
    EntityCustomField.belongsTo(models.TypeDocument, {
      foreignKey: "type_document_id",
      as: "typeDocument",
    });
  };

  return EntityCustomField;
};