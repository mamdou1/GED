// backend/scripts/addNumberFieldType.js
// Ajoute la valeur 'number' à l'ENUM piece_meta_fields.field_type.
// Idempotent : ne fait rien si 'number' est déjà présent.
require("dotenv").config();
const sequelize = require("../config/database");

const TARGET_TYPE = "enum('text','date','file','number')";

(async () => {
  try {
    await sequelize.authenticate();
    const dbName = sequelize.config.database;

    const [rows] = await sequelize.query(
      `SELECT COLUMN_TYPE AS t FROM information_schema.columns
       WHERE table_schema = ? AND table_name = 'piece_meta_fields' AND column_name = 'field_type'`,
      { replacements: [dbName] },
    );
    const current = (rows[0] && rows[0].t) || "";

    if (current.includes("'number'")) {
      console.log("= 'number' déjà présent dans field_type");
    } else {
      await sequelize.query(
        `ALTER TABLE piece_meta_fields
         MODIFY COLUMN field_type ${TARGET_TYPE} NOT NULL`,
      );
      console.log("+ 'number' ajouté à l'ENUM field_type");
    }
    console.log("✅ Migration field_type terminée");
    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error("❌ Échec migration:", e.message);
    process.exit(1);
  }
})();
