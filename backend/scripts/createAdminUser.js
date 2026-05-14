// scripts/createAdminUser.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../models");

async function createAdminUser() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log("🚀 Début de la création de l'utilisateur administrateur...");

    // 1. Créer le droit "Administrateur"
    let droitAdmin = await db.Droit.findOne({
      where: { libelle: "Administrateur" },
      transaction,
    });

    if (!droitAdmin) {
      droitAdmin = await db.Droit.create(
        {
          libelle: "Administrateur",
        },
        { transaction },
      );
      console.log('✅ Droit "Administrateur" créé avec succès');
    } else {
      console.log('ℹ️ Le droit "Administrateur" existe déjà');
    }

    // 2. Récupérer toutes les permissions
    const toutesPermissions = await db.Permission.findAll({ transaction });
    console.log(`📋 ${toutesPermissions.length} permissions trouvées`);

    // 3. Affecter toutes les permissions
    if (toutesPermissions.length > 0) {
      const permissionsActuelles = await droitAdmin.getPermissions({
        transaction,
      });
      const permissionsActuellesIds = permissionsActuelles.map((p) => p.id);
      const nouvellesPermissions = toutesPermissions.filter(
        (p) => !permissionsActuellesIds.includes(p.id),
      );

      if (nouvellesPermissions.length > 0) {
        await droitAdmin.addPermissions(nouvellesPermissions, { transaction });
        console.log(
          `✅ ${nouvellesPermissions.length} nouvelles permissions ajoutées`,
        );
      } else {
        console.log("ℹ️ Toutes les permissions sont déjà associées");
      }
    }

    // 4. Créer ou mettre à jour l'utilisateur admin
    const adminExistant = await db.Agent.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: "admin55" },
          { email: "admin@systeme.local" },
        ],
      },
      transaction,
    });

    if (adminExistant) {
      console.log("⚠️ Un utilisateur avec ce username ou email existe déjà");
      await adminExistant.update({ droit_id: droitAdmin.id }, { transaction });
      console.log("✅ Droit Administrateur attribué à l'utilisateur existant");

      console.log("\n📝 Informations de l'utilisateur existant :");
      console.log(`   Username: ${adminExistant.username}`);
      console.log(`   Email: ${adminExistant.email}`);
      console.log(`   Nom: ${adminExistant.nom || "Non défini"}`);
      console.log(`   Prénom: ${adminExistant.prenom || "Non défini"}`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin6565", salt);

      const nouvelAdmin = await db.Agent.create(
        {
          nom: "Administrateur",
          prenom: "Système",
          num_matricule: "ADMIN001",
          email: "admin@systeme.local",
          username: "admin66",
          password: hashedPassword,
          telephone: "0000000001",
          droit_id: droitAdmin.id,
          is_on_line: false,
          is_verified_for_reset: true,
          photo_profil: "",
        },
        { transaction },
      );

      console.log("✅ Utilisateur administrateur créé avec succès !");
      console.log("\n📝 Informations de connexion :");
      console.log(`   Username: ${nouvelAdmin.username}`);
      console.log(`   Password: admin6565`);
      console.log(`   Email: ${nouvelAdmin.email}`);
      console.log(`   Nom complet: ${nouvelAdmin.prenom} ${nouvelAdmin.nom}`);
    }

    // 5. Vérification finale - CORRECTION ICI : utiliser 'Permissions' au lieu de 'permissions'
    const verificationDroit = await db.Droit.findByPk(droitAdmin.id, {
      include: [
        {
          model: db.Permission,
          as: "Permissions",
          through: { attributes: [] },
          // Pas de 'as' car on utilise l'alias par défaut 'Permissions'
        },
      ],
      transaction,
    });

    console.log("\n📊 Récapitulatif :");
    console.log(`   Droit: ${verificationDroit.libelle}`);
    // ICI : utiliser 'Permissions' avec P majuscule
    console.log(
      `   Nombre de permissions associées: ${verificationDroit.Permissions ? verificationDroit.Permissions.length : 0}`,
    );

    await transaction.commit();
    console.log("\n✨ Script exécuté avec succès !");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Erreur lors de l'exécution du script :", error);
    throw error;
  }
}

createAdminUser()
  .then(() => {
    console.log("🏁 Fin du script");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Le script a échoué :", error);
    process.exit(1);
  });
