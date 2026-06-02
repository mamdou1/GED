module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define(
    "Client",
    {
      nom: DataTypes.STRING,
      prenom: DataTypes.STRING,
      raison_sociale: DataTypes.STRING,
      num_matricule: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      sigle: {
        type: DataTypes.STRING,
        unique: true,
      },
      telephone: {
        type: DataTypes.STRING,
        unique: true,
      },
      adresse: {
        type: DataTypes.STRING,
        unique: true,
      },
      lieu_naissance: {
        type: DataTypes.STRING,
        unique: true,
      },
      nationalite: {
        type: DataTypes.STRING,
        unique: true,
      },
      profession: {
        type: DataTypes.STRING,
        unique: true,
      },
      statut_matrimonial: {
        type: DataTypes.STRING,
        unique: true,
      },
      date_naissance: {
        type: DataTypes.DATE,
        unique: true,
      },
      numero_registre_commerce: {
        type: DataTypes.STRING,
        unique: true,
      },
      nif: {
        type: DataTypes.STRING,
        unique: true,
      },
      conserne: {
        type: DataTypes.ENUM("Personne physique", "Personne morale"),
        allowNull: true, // facultatif
      },
      enregistrer_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "client",
      timestamps: true,
      underscored: true,
    },
  );

  Client.associate = (models) => {
    Client.belongsTo(models.Agent, {
      as: "createur",
      foreignKey: "enregistrer_par",
      // constraints: false,
    });

    Client.belongsToMany(models.TypeDocument, {
      through: "client_type_documents",
      foreignKey: "client_id",
      otherKey: "type_document_id",
      as: "types_document",
    });

    Client.hasMany(models.Compte, {
      foreignKey: "client_id",
      as: "comptes",
    });
  };

  return Client;
};
