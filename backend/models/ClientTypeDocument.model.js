module.exports = (sequelize, DataTypes) => {
  const ClientTypeDocument = sequelize.define(
    "ClientTypeDocument",
    {
      client_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      type_document_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: "client_type_documents",
      timestamps: true,
      underscored: true,
    },
  );

  return ClientTypeDocument;
};
