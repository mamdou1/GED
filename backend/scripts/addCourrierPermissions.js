// scripts/addCourrierPermissions.js
const db = require('../models');

async function addCourrierPermissions() {
  const transaction = await db.sequelize.transaction();

  try {
    console.log('🚀 Début de l\'ajout des permissions Courrier...\n');

    const permissionsToAdd = [
      { resource: 'courrier', action: 'access' },   // Important pour le sidebar
      { resource: 'courrier', action: 'read' },
      { resource: 'courrier', action: 'create' },
      { resource: 'courrier', action: 'update' },
      { resource: 'courrier', action: 'delete' },
      { resource: 'courrier', action: 'transfer' },
    ];

    let createdCount = 0;

    for (const perm of permissionsToAdd) {
      const [permission, created] = await db.Permission.findOrCreate({
        where: {
          resource: perm.resource,
          action: perm.action,
        },
        defaults: {
          resource: perm.resource,
          action: perm.action,
        },
        transaction
      });

      if (created) {
        console.log(`✅ Nouvelle permission créée : ${perm.resource}.${perm.action}`);
        createdCount++;
      } else {
        console.log(`ℹ️  Permission existe déjà : ${perm.resource}.${perm.action}`);
      }
    }

    // Récupérer le droit Administrateur
    const droitAdmin = await db.Droit.findOne({
      where: { libelle: 'Administrateur' },
      transaction
    });

    if (!droitAdmin) {
      console.log('❌ Droit "Administrateur" non trouvé dans la table Droit');
      await transaction.rollback();
      process.exit(1);
    }

    // Récupérer toutes les permissions courrier
    const allCourrierPermissions = await db.Permission.findAll({
      where: { resource: 'courrier' },
      transaction
    });

    // Associer toutes les permissions à l'Administrateur
    await droitAdmin.addPermissions(allCourrierPermissions, { transaction });

    console.log(`\n✅ ${allCourrierPermissions.length} permissions Courrier associées au droit "Administrateur"`);

    await transaction.commit();

    console.log(`\n✨ Opération terminée avec succès ! ${createdCount} nouvelle(s) permission(s) créée(s).`);
    console.log('   → Connecte-toi avec un compte Administrateur et rafraîchis la page.');

    process.exit(0);

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors de l\'ajout des permissions :', error.message);
    process.exit(1);
  }
}

addCourrierPermissions();