1 - dans server.js defile jusqu'en bas, enlève les commentaires :

- //await sequelize.sync({ alter: true });
- Le code en bas de ce commentaire // Vérifier que les tables existent

2- Pour crée un admin :

- node scripts/createAdminUser.js

3- Pour crée un organigrame et les fonction ratacher à ce organigrame :

- node scripts/organigrameFonction.js

4- Pour la création des types de documents:

- node scripts/insertTypeDocuments.js
