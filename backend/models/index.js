const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const db = {};

// 🔹 Import des modèles
db.Pieces = require("./Pieces.model")(sequelize, DataTypes);
db.Token = require("./token.model")(sequelize, DataTypes);
db.Exercice = require("./Exercice.model")(sequelize, DataTypes);
db.Agent = require("./Agent.model")(sequelize, DataTypes);

db.Permission = require("./Permission.model")(sequelize, DataTypes);
db.Droit = require("./Droit.model")(sequelize, DataTypes);

db.Fonction = require("./Fonction.model")(sequelize, DataTypes);

db.HistoriqueLog = require("./HistoriqueLog.model")(sequelize, DataTypes);

// =====================
// 🔹 NOUVEAUX MODÈLES DOCUMENTS
// =====================

db.TypeDocument = require("./DocumentType.model")(sequelize, DataTypes);
db.MetaField = require("./MetaField.model")(sequelize, DataTypes);
db.Document = require("./Document.model")(sequelize, DataTypes);
db.DocumentValue = require("./DocumentValue.model")(sequelize, DataTypes);
db.DocumentFile = require("./DocumentFIle.model")(sequelize, DataTypes);
db.DocumentEntity = require("./DocumentEntity")(sequelize, DataTypes);

// =====================
// 🔹 NOUVEAUX MODÈLES Archive
// =====================

db.Site = require("./Sites.model")(sequelize, DataTypes);
db.Salle = require("./Salle.model")(sequelize, DataTypes);
db.Rayon = require("./Rayon.model")(sequelize, DataTypes);
db.Trave = require("./Trave.model")(sequelize, DataTypes);
db.Box = require("./Box.model")(sequelize, DataTypes);
db.TypeOutilsConservation = require("./OutilsConservation.model")(
  sequelize,
  DataTypes,
);

// =====================
// 🔹 NOUVEAUX MODÈLES DOC
// =====================
db.TypeDocumentPieces = require("./DocumentTypePiece.model")(
  sequelize,
  DataTypes,
);
db.DocumentFichier = require("./DocumentFichier.model")(sequelize, DataTypes);
db.DocumentPieces = require("./DocumentPieces.model")(sequelize, DataTypes);

// =====================
// 🔹 NOUVEAUX MODÈLES Entitee
// =====================
db.EntiteeUn = require("./EntiteeUn.model")(sequelize, DataTypes);
db.EntiteeDeux = require("./EntiteeDeux.model")(sequelize, DataTypes);
db.EntiteeTrois = require("./EntiteeTrois.model")(sequelize, DataTypes);

// =====================
// 🔹 NOUVEAUX MODÈLES pour l'acces
// =====================
db.AgentEntiteeAccess = require("./AgentEntiteeAccess.model")(
  sequelize,
  DataTypes,
);

// =====================
// 🔹 NOUVEAUX MODÈLES pour les meta donnée de pièces
// =====================
db.PiecesFile = require("./PicesFile.model")(sequelize, DataTypes);
db.PieceValue = require("./PieceValue.model")(sequelize, DataTypes);
db.PieceMetaField = require("./PieceMetaField.model")(sequelize, DataTypes);
db.PiecesFichier = require("./PiecesFichier.model")(sequelize, DataTypes);
db.EntityTypeDocumentPiece = require("./EntityTypeDocumentPiece.model")(
  sequelize,
  DataTypes,
);

//Models pour les courriers

db.Courrier = require("./Courrier.model")(sequelize, DataTypes);
db.PieceJointe = require("./PieceJointe.model")(sequelize, DataTypes);
db.AttributionCourrier = require("./AttributionCourrier.model")(
  sequelize,
  DataTypes,
);
db.TraitementCourrier = require("./TraitementCourrier.model")(
  sequelize,
  DataTypes,
);
db.AuditCourrier = require("./AuditCourrier.model")(sequelize, DataTypes);
db.Expediteur = require("./Expediteur.model")(sequelize, DataTypes);
db.DestinataireExterne = require("./DestinataireExterne.model")(
  sequelize,
  DataTypes,
);

// =====================
// 🔹 NOUVEAUX MODÈLES pour la personnalisation par entité
// =====================
db.MetaFieldOverride = require("./MetaFieldOverride")(sequelize, DataTypes);
db.EntityCustomField = require("./EntityCustomField")(sequelize, DataTypes);
db.EntityCustomFieldValue = require("./EntityCustomFieldValue")(
  sequelize,
  DataTypes,
);

// 🔹 Appel des associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//console.log("Models chargés:", Object.keys(db));

// 🔹 Exports
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
