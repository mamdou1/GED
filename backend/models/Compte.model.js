// module.exports = (sequelize, DataTypes) => {
//   const Compte = sequelize.define(
//     "Compte",
//     {
//       numero_compte: DataTypes.STRING,
//       agence: DataTypes.STRING,
//       type_compte_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true, // Ou false selon votre besoin de rigueur
//       },
//       client_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true, // Ou false selon votre besoin de rigueur
//       },
//     },
//     {
//       tableName: "compte",
//       timestamps: true,
//       underscored: true,
//     },
//   );

//   Compte.associate = (models) => {
//     Compte.belongsTo(models.TypeCompte, {
//       foreignKey: "type_compte_id",
//       as: "type_compte",
//     });

//     Compte.belongsTo(models.Client, {
//       foreignKey: "client_id",
//       as: "client",
//     });
//   };

//   return Compte;
// };

// models/Compte.js
module.exports = (sequelize, DataTypes) => {
  const Compte = sequelize.define(
    "Compte",
    {
      type_compte_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      agent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    { tableName: "comptes", timestamps: true, underscored: true },
  );

  Compte.associate = (models) => {
    Compte.belongsTo(models.TypeCompte, {
      foreignKey: "type_compte_id",
      as: "type_compte",
    });

    Compte.hasMany(models.TypeCompteMetaFieldValue, {
      foreignKey: "compte_id",
      as: "values",
    });

    Compte.belongsTo(models.Client, {
      foreignKey: "client_id",
      as: "client",
    });

    Compte.belongsTo(models.Agent, {
      foreignKey: "agent_id",
      as: "agent",
    });
  };

  return Compte;
};
