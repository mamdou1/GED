// backend/scripts/addExtractionColumns.js
// Ajoute (si absentes) les colonnes d'extraction sur piece_meta_fields.
// Idempotent : vérifie information_schema avant ALTER.
require("dotenv").config();
const sequelize = require("../config/database");

const COLUMNS = [
  { name: "extraction_keywords", ddl: "JSON NULL" },
  { name: "extraction_pattern", ddl: "VARCHAR(255) NULL" },
];

(async () => {
  try {
    await sequelize.authenticate();
    const dbName = sequelize.config.database;

    for (const col of COLUMNS) {
      const [rows] = await sequelize.query(
        `SELECT COUNT(*) AS c FROM information_schema.columns
         WHERE table_schema = ? AND table_name = 'piece_meta_fields' AND column_name = ?`,
        { replacements: [dbName, col.name] },
      );
      const exists = rows[0].c > 0;
      if (exists) {
        console.log(`= colonne ${col.name} déjà présente`);
        continue;
      }
      await sequelize.query(
        `ALTER TABLE piece_meta_fields ADD COLUMN ${col.name} ${col.ddl}`,
      );
      console.log(`+ colonne ${col.name} ajoutée`);
    }
    console.log("✅ Migration colonnes extraction terminée");
    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error("❌ Échec migration:", e.message);
    process.exit(1);
  }
})();
