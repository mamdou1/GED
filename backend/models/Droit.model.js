module.exports = (sequelize, DataTypes) => {
  const Droit = sequelize.define(
    "Droit",
    {
      libelle: DataTypes.STRING,
    },
    {
      tableName: "droit",
      timestamps: true,
      underscored: true,
    },
  );
  Droit.associate = (models) => {
    Droit.belongsToMany(models.Permission, {
      through: "droit_permission",
      foreignKey: "droit_id",
      otherKey: "permission_id",
      as: "Permissions",
      timestamps: false,
    });

    Droit.hasMany(models.Agent, { foreignKey: "droit_id", as: "agents" });
  };

  return Droit;
};
