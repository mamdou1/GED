module.exports = (sequelize, DataTypes) => {
  const MetaField = sequelize.define(
    "MetaField",
    {
      name: DataTypes.STRING,
      label: DataTypes.STRING,
      field_type: DataTypes.STRING,
      required: DataTypes.BOOLEAN,
      options: DataTypes.JSON,
      position: DataTypes.INTEGER,
    },
    {
      tableName: "metafields",
      underscored: true,
      timestamps: true,
    },
  );

  MetaField.associate = (models) => {
    MetaField.belongsTo(models.TypeDocument, {
      foreignKey: "type_document_id",
      as: "typeDocument",
    });
    MetaField.hasMany(models.DocumentValue, {
      foreignKey: "meta_field_id",
      as: "values",
    });
  };

  return MetaField;
};
