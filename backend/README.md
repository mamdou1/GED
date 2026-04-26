1 - dans server.js defile jusqu'en bas, enlève les commentaires :

- //await sequelize.sync({ alter: true });
- Le code en bas de ce commentaire // Vérifier que les tables existent

2- Pour crée un admin :

- node scripts/createAdminUser.js

3- Pour crée un organigrame et les fonction ratacher à ce organigrame :

- node scripts/organigrameFonction.js

4- Pour la création des types de documents:

- node scripts/insertTypeDocuments.js

---

Composants créés/modifiés

Composant Fichier Rôle

DocumentListe DocumentListe.tsx Liste des documents regroupés par Entité → Type, avec cases à cocher
DocumentArchivage DocumentArchivage.tsx Sélection d'un Box (filtré par type de document) → chemin auto-rempli → archivage
DocumentListeEtArchivage DocumentListeEtArchivage.tsx Layout 50/50 qui assemble les deux
BoxListe BoxListe.tsx Liste des boxes regroupés par Entité → Type, avec chemin d'affectation affiché
BoxAffectationTravee BoxAffectationTravee.tsx Affectation/Déplacement/Retrait de box vers une travée
BoxListeEtAffectation BoxListeEtAffectation.tsx Layout 50/50 pour l'affectation des box
BoxForm BoxForm.tsx Création/Modification de box (identité + localisation cascade)
BoxAffectationForm BoxAffectationForm.tsx Rattachement d'un box aux entités structurelles (N1→N2→N3→Type)
AddToBoxForm AddToBoxForm.tsx Wrapper pour archiver un document unique
useArchivageQueries useArchivageQueries.ts Hooks TanStack Query pour Sites, Salles, Rayons, Travées, Boxes
APIs backend
Route Méthode Action
/trave/box/:boxId/add/:traveId POST Ajouter un box à une travée
/trave/box/:boxId/remove POST Retirer un box de sa travée
/box/:boxId/add/:documentId POST Ajouter un document à un box
