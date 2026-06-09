// scan-agent/src/server.js
const express = require("express");
const cors = require("cors");
const { runScanFlow } = require("./scanFlow");

// opts: { mock?, origin? }
function createApp(opts = {}) {
  const app = express();
  const origin = opts.origin || process.env.FRONTEND_ORIGIN || "http://localhost:4000";

  app.use(cors({ origin }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", mock: !!opts.mock });
  });

  app.post("/scan", async (req, res) => {
    try {
      const { profile, lang } = req.body || {};
      const out = await runScanFlow({ mock: !!opts.mock, profile, lang });
      res.json(out);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return app;
}

// Démarrage direct (node src/server.js [--mock])
if (require.main === module) {
  const mock = process.argv.includes("--mock");
  const port = parseInt(process.env.SCAN_AGENT_PORT || "7777", 10);
  const app = createApp({ mock });
  app.listen(port, "127.0.0.1", () => {
    console.log(
      `🖨️  Agent scan PADME sur http://127.0.0.1:${port}${mock ? " (mode MOCK)" : ""}`,
    );
  });
}

module.exports = { createApp };
