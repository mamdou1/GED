// models/MetaFieldOverride.js
module.exports = (sequelize, DataTypes) => {
  const MetaFieldOverride = sequelize.define(
    "MetaFieldOverride",
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
      meta_field_id: {
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
      label_override: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      required_override: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      position_override: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      options_override: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      default_value_override: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      placeholder_override: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description_override: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      validation_rules_override: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "meta_field_overrides",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["type_document_id", "meta_field_id", "entity_type", "entity_id"],
          name: "unique_override_per_entity",
        },
      ],
    }
  );

  MetaFieldOverride.associate = (models) => {
    MetaFieldOverride.belongsTo(models.TypeDocument, {
      foreignKey: "type_document_id",
      as: "typeDocument",
    });
    MetaFieldOverride.belongsTo(models.MetaField, {
      foreignKey: "meta_field_id",
      as: "metaField",
    });
  };

  return MetaFieldOverride;
};