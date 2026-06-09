// scan-agent/src/naps2.js
const path = require("path");
const { execFile } = require("child_process");

// Chemin de NAPS2.Console.exe (configurable). Défaut : installation standard.
const NAPS2_PATH =
  process.env.NAPS2_PATH ||
  "C:\\Program Files\\NAPS2\\NAPS2.Console.exe";
const NAPS2_PROFILE = process.env.NAPS2_PROFILE || "Default";

// opts: { profile?, workDir }
// Scanne via un profil NAPS2 pré-configuré vers un TIFF multipage. Retourne le chemin image.
function scanToImage({ profile, workDir }) {
  const out = path.join(workDir, "scan.tif");
  const prof = profile || NAPS2_PROFILE;
  const args = ["-p", prof, "-o", out, "--force"];

  return new Promise((resolve, reject) => {
    execFile(NAPS2_PATH, args, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) {
        return reject(
          new Error(`NAPS2 a échoué: ${err.message} ${stderr || ""}`.trim()),
        );
      }
      resolve(out);
    });
  });
}

module.exports = { scanToImage };
