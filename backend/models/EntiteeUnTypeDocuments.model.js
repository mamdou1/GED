module.exports = (sequelize, DataTypes) => {
  const EntiteeUnTypeDocuments = sequelize.define(
    "EntiteeUnTypeDocuments",
    {
      entitee_un_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      type_document_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: "entitee_un_type_documents",
      timestamps: false,
      underscored: true,
    },
  );

  return EntiteeUnTypeDocuments;
};
