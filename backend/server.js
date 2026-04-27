const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

dotenv.config();

const sequelize = require("./config/database");
//const historiqueLogger = require("./middlewares/historiqueLogger.middleware");
const { updateActivity } = require("./middlewares/updateActivity.middleware");
const { verifyToken } = require("./middlewares/auth.middleware");

// ✅ ICI (avant authenticate / sync)
require("./models");

const app = express();

// ✅ CORS EN PREMIER
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-audit",
      "x-sidebar-navigation",
    ],
  }),
);

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// historique (optionnel)
//app.use(historiqueLogger);

// ✅ routes publiques AVANT verifyToken
app.use("/api/auth", require("./routes/auth.routes"));

// Swagger docs (PUBLIC)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ middleware auth après auth routes
app.use(verifyToken);
app.use(updateActivity);

// ✅ routes protégées
app.use("/api/exercices", require("./routes/exercice.routes"));
app.use("/api/statistiques", require("./routes/statistiques.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/pieces", require("./routes/Pieces.routes"));

app.use("/api/permissions", require("./routes/permission.routes"));
app.use("/api/droits", require("./routes/droit.routes"));
app.use("/api/droitPermission", require("./routes/droitPermission.routes"));

app.use("/api/fonctions", require("./routes/fonction.routes"));
app.use("/api/historique", require("./routes/historique.routes"));

app.use("/api/types-documents", require("./routes/typeDocument.routes"));
app.use("/api/meta-fields", require("./routes/metafield.routes"));
app.use("/api/documents", require("./routes/document.routes"));

app.use("/api/site", require("./routes/site.routes"));
app.use("/api/salle", require("./routes/salle.routes"));
app.use("/api/rayon", require("./routes/rayon.routes"));
app.use("/api/trave", require("./routes/trave.routes"));
app.use("/api/box", require("./routes/box.routes"));

app.use("/api/entiteeUn", require("./routes/entiteeUn.routes"));
app.use("/api/entiteeDeux", require("./routes/entiteeDeux.routes"));
app.use("/api/entiteeTrois", require("./routes/entiteeTrois.routes"));

app.use("/api/agent-access", require("./routes/agentAccess.routes"));
app.use("/api", require("./routes/pieceMetaField.routes"));
app.use("/api", require("./routes/pieceValue.routes"));
app.use("/api/courrier", require("./routes/courrier.routes"));
app.use("/api/expediteur", require("./routes/expediteur.routes"));
app.use(
  "/api/destinataire-externe",
  require("./routes/destinataireExterne.routes"),
);

app.use("/api/sync", require("./routes/sync.routes"));

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Connexion MySQL + lancement serveur
// 2️⃣ Connexion + sync
sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Connexion MySQL réussie");

    //await sequelize.sync({ alter: true });
    await sequelize.sync();
    // Vérifier que les tables existent
    // const tables = await sequelize.query("SHOW TABLES");
    // console.log(
    //   "📋 Tables créées:",
    //   tables[0].map((t) => Object.values(t)[0]),
    // );

    // 3️⃣ SEEDER APRÈS sync
    await require("./seeders/001-permissions.seeder")();

    // 4️⃣ Lancer le serveur
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${process.env.PORT}`);
    });
  })
  .catch(console.error);
