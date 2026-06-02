module.exports = (sequelize, DataTypes) => {
  const TypeCompteMetaFieldValue = sequelize.define(
    "TypeCompteMetaFieldValue",
    {
      value: DataTypes.TEXT,
    },
    {
      tableName: "type_compte_metafield_values",
      timestamps: true,
      underscored: true,
    },
  );

  TypeCompteMetaFieldValue.associate = (models) => {
    TypeCompteMetaFieldValue.belongsTo(models.Compte, {
      foreignKey: "compte_id",
      as: "compte",
    });
    TypeCompteMetaFieldValue.belongsTo(models.TypeCompteMetaField, {
      foreignKey: "meta_field_id",
      as: "metaField",
    });
  };

  return TypeCompteMetaFieldValue;
};
