module.exports = (sequelize, DataTypes) => {
  const DocumentValue = sequelize.define(
    "DocumentValue",
    {
      value: DataTypes.TEXT,
    },
    { tableName: "documentvalues", timestamps: true, underscored: true },
  );

  DocumentValue.associate = (models) => {
    DocumentValue.belongsTo(models.Document, {
      foreignKey: "document_id",
      as: "document",
    });
    DocumentValue.belongsTo(models.MetaField, {
      foreignKey: "meta_field_id",
      as: "metaField",
    });
    DocumentValue.hasOne(models.DocumentFile, {
      foreignKey: "document_value_id",
      as: "files",
    });

    DocumentValue.hasOne(models.DocumentFichier, {
      foreignKey: "document_value_id",
      as: "file",
    });
  };

  return DocumentValue;
};
