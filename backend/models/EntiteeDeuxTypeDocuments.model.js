module.exports = (sequelize, DataTypes) => {
  const EntiteeDeuxTypeDocuments = sequelize.define(
    "EntiteeDeuxTypeDocuments",
    {
      entitee_deux_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      type_document_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: "entitee_deux_type_documents",
      timestamps: false,
      underscored: true,
    },
  );

  return EntiteeDeuxTypeDocuments;
};
