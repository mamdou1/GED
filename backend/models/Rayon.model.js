module.exports = (sequelize, DataTypes) => {
  const Rayon = sequelize.define(
    "Rayon",
    {
      code: { type: DataTypes.STRING, allowNull: false },
    },
    status: {
        type: DataTypes.ENUM("OCCUPE", "LIBRE", "PLIEN", "RESERVER"),
        allowNull: false,
        defaultValue: "LIBRE",
      },
    capacite_max: { type: DataTypes.INTEGER, allowNull: false },
    current_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    { tableName: "rayons", underscored: true },
  );

  Rayon.associate = (models) => {
    Rayon.belongsTo(models.Salle, { foreignKey: "salle_id", as: "salle" });
    Rayon.hasMany(models.Trave, { foreignKey: "rayon_id", as: "traves" });
  };
  return Rayon;
};
