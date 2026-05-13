module.exports = (sequelize, DataTypes) => {
  const EntiteeTroisTypeDocuments = sequelize.define(
    "EntiteeTroisTypeDocuments",
    {
      entitee_trois_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      type_document_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: "entitee_trois_type_documents",
      timestamps: false,
      underscored: true,
    },
  );

  return EntiteeTroisTypeDocuments;
};
