module.exports = (sequelize, DataTypes) => {
  const TypeOutilsConservation = sequelize.define(
    "TypeOutilsConservation",
    {
      nom: DataTypes.STRING,
    },
    {
      tableName: "type_outils_conservation",
      underscored: true,
      timestamps: true,
    },
  );
  TypeOutilsConservation.associate = (models) => {
    TypeOutilsConservation.hasMany(models.Box, {
      foreignKey: "type_outils_conservation_id",
      as: "boxes",
    });
  };
  return TypeOutilsConservation;
};
