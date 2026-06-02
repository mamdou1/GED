module.exports = (sequelize, DataTypes) => {
  const TypeCompte = sequelize.define(
    "TypeCompte",
    {
      nom: DataTypes.STRING,
    },
    {
      tableName: "type_compte",
      underscored: true,
      timestamps: true,
    },
  );
  TypeCompte.associate = (models) => {
    TypeCompte.hasMany(models.Compte, {
      foreignKey: "type_compte_id",
      as: "comptes",
    });
    TypeCompte.hasMany(models.TypeDocument, {
      foreignKey: "type_compte_id",
      as: "typeDocuments",
    });
    TypeCompte.hasMany(models.TypeCompteMetaField, {
      foreignKey: "type_compte_id",
      as: "metaFields",
    });
  };
  return TypeCompte;
};
