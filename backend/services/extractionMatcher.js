// backend/services/extractionMatcher.js
// Moteur de règles d'extraction — fonctions PURES (aucune I/O).

// Map accent -> base, 1:1 (préserve les index de caractères).
const ACCENT_MAP = {
  à: "a", â: "a", ä: "a", á: "a", ã: "a",
  è: "e", é: "e", ê: "e", ë: "e",
  ì: "i", í: "i", î: "i", ï: "i",
  ò: "o", ó: "o", ô: "o", ö: "o", õ: "o",
  ù: "u", ú: "u", û: "u", ü: "u",
  ç: "c", ñ: "n",
  À: "A", Â: "A", Ä: "A", Á: "A", Ã: "A",
  È: "E", É: "E", Ê: "E", Ë: "E",
  Ì: "I", Í: "I", Î: "I", Ï: "I",
  Ò: "O", Ó: "O", Ô: "O", Ö: "O", Õ: "O",
  Ù: "U", Ú: "U", Û: "U", Ü: "U",
  Ç: "C", Ñ: "N",
};

function foldAccents(str) {
  return String(str).replace(/[^ -~]/g, (ch) => ACCENT_MAP[ch] || ch);
}

const FR_MONTHS = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function normalizeYear(y) {
  const n = parseInt(y, 10);
  if (y.length <= 2) return 2000 + n;
  return n;
}

function isValidDmy(d, m, y) {
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2999;
}

function parseDateFr(raw) {
  if (!raw) return "";
  const s = foldAccents(String(raw)).toLowerCase();

  // jj/mm/aaaa, jj-mm-aaaa, jj.mm.aa
  const num = s.match(/(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{2,4})/);
  if (num) {
    const d = parseInt(num[1], 10);
    const m = parseInt(num[2], 10);
    const y = normalizeYear(num[3]);
    if (isValidDmy(d, m, y)) return `${y}-${pad2(m)}-${pad2(d)}`;
  }

  // jj mois aaaa (gère "1er")
  const txt = s.match(/(\d{1,2})\s*(?:er)?\s+([a-z]+)\s+(\d{4})/);
  if (txt) {
    const d = parseInt(txt[1], 10);
    const m = FR_MONTHS[txt[2]];
    const y = parseInt(txt[3], 10);
    if (m && isValidDmy(d, m, y)) return `${y}-${pad2(m)}-${pad2(d)}`;
  }

  return "";
}

function parseNumber(raw) {
  if (raw == null || raw === "") return "";
  // Retire les espaces, puis les points "milliers" : un point suivi de 3 chiffres
  // qui sont suivis d'un autre groupe de 3, d'une virgule décimale, ou de la fin du nombre.
  // La boucle gère les groupes de milliers chaînés (ex: 1.250.000).
  let s = String(raw).replace(/\s/g, "");
  let prev;
  do {
    prev = s;
    s = s.replace(/(\d)\.(\d{3})(?=\.\d{3}|,|$|\D)/g, "$1$2");
  } while (s !== prev);
  const m = s.match(/-?\d+(?:[.,]\d+)?/);
  return m ? m[0].replace(",", ".") : "";
}

function parseValueByType(raw, fieldType) {
  switch (fieldType) {
    case "date":
      return parseDateFr(raw);
    case "number":
      return parseNumber(raw);
    case "file":
      return "";
    default:
      return String(raw || "").trim().replace(/\s+/g, " ");
  }
}

module.exports = {
  foldAccents,
  parseDateFr,
  parseNumber,
  parseValueByType,
};
