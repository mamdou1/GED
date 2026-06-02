module.exports = (sequelize, DataTypes) => {
  const TypeCompteMetaField = sequelize.define(
    "TypeCompteMetaField",
    {
      name: DataTypes.STRING,
      label: DataTypes.STRING,
      field_type: DataTypes.STRING,
      required: DataTypes.BOOLEAN,
      options: DataTypes.JSON,
      position: DataTypes.INTEGER,
    },
    {
      tableName: "type_compte_metafields",
      underscored: true,
      timestamps: false,
    },
  );

  TypeCompteMetaField.associate = (models) => {
    TypeCompteMetaField.belongsTo(models.TypeCompte, {
      foreignKey: "type_compte_id",
      as: "typeCompte",
    });
    TypeCompteMetaField.hasMany(models.TypeCompteMetaFieldValue, {
      foreignKey: "meta_field_id",
      as: "values",
    });
  };

  return TypeCompteMetaField;
};
