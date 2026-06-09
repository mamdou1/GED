// scan-agent/src/scanFlow.js
const fs = require("fs");
const path = require("path");
const os = require("os");

const FIXTURES = path.join(__dirname, "..", "fixtures");

// opts: { mock?: boolean, profile?: string, lang?: string }
// retourne { pdfBase64, ocrText, pages }
async function runScanFlow(opts = {}) {
  if (opts.mock) {
    const ocrText = fs.readFileSync(path.join(FIXTURES, "sample.txt"), "utf8");
    const pdfBase64 = fs.readFileSync(path.join(FIXTURES, "sample.pdf")).toString("base64");
    return { pdfBase64, ocrText, pages: 1 };
  }

  // Branche réelle (implémentée en Task 6 : naps2 + ocr)
  const { scanToImage } = require("./naps2");
  const { ocrImage } = require("./ocr");

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "padme-scan-"));
  try {
    const imagePath = await scanToImage({ profile: opts.profile, workDir });
    const { ocrText, pdfPath, pages } = await ocrImage({
      imagePath,
      lang: opts.lang || "fra",
      workDir,
    });
    const pdfBase64 = fs.readFileSync(pdfPath).toString("base64");
    return { pdfBase64, ocrText, pages };
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

module.exports = { runScanFlow };
