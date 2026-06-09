// scan-agent/src/ocr.js
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

// Chemin de tesseract (configurable).
const TESSERACT_PATH = process.env.TESSERACT_PATH || "tesseract";

// opts: { imagePath, lang, workDir }
// Produit base.txt + base.pdf (searchable). Retourne { ocrText, pdfPath, pages }.
function ocrImage({ imagePath, lang, workDir }) {
  const base = path.join(workDir, "out");
  // tesseract <image> <base> -l fra txt pdf  => out.txt + out.pdf
  const args = [imagePath, base, "-l", lang || "fra", "txt", "pdf"];

  return new Promise((resolve, reject) => {
    execFile(TESSERACT_PATH, args, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) {
        return reject(
          new Error(`Tesseract a échoué: ${err.message} ${stderr || ""}`.trim()),
        );
      }
      try {
        const ocrText = fs.readFileSync(`${base}.txt`, "utf8");
        const pdfPath = `${base}.pdf`;
        // Estimation pages : nb de form feeds + 1
        const pages = (ocrText.match(/\f/g) || []).length + 1;
        resolve({ ocrText, pdfPath, pages });
      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = { ocrImage };
