const {
  foldAccents,
  parseDateFr,
  parseNumber,
  parseValueByType,
} = require("../extractionMatcher");

describe("foldAccents", () => {
  test("retire les accents en conservant la longueur", () => {
    expect(foldAccents("Numéro")).toBe("Numero");
    expect(foldAccents("Référence à payer")).toBe("Reference a payer");
    expect(foldAccents("Numéro").length).toBe("Numéro".length); // 1:1
  });
});

describe("parseDateFr", () => {
  test("formats numériques FR -> ISO", () => {
    expect(parseDateFr("12/03/2024")).toBe("2024-03-12");
    expect(parseDateFr("01-9-2023")).toBe("2023-09-01");
    expect(parseDateFr("5.11.24")).toBe("2024-11-05");
  });
  test("mois en lettres FR -> ISO", () => {
    expect(parseDateFr("12 mars 2024")).toBe("2024-03-12");
    expect(parseDateFr("1er février 2023")).toBe("2023-02-01");
  });
  test("vide si non reconnu", () => {
    expect(parseDateFr("pas une date")).toBe("");
  });
});

describe("parseNumber", () => {
  test("extrait le nombre et normalise le séparateur", () => {
    expect(parseNumber("Montant : 1 250,50 FCFA")).toBe("1250.50");
    expect(parseNumber("12")).toBe("12");
    expect(parseNumber("rien")).toBe("");
  });
  test("gère le point comme séparateur de milliers (format FR/FCFA)", () => {
    expect(parseNumber("1.250,50")).toBe("1250.50");
    expect(parseNumber("1.250.000")).toBe("1250000");
    expect(parseNumber("3,5")).toBe("3.5");
    expect(parseNumber("Total 42.00")).toBe("42.00");
  });
});

describe("parseValueByType", () => {
  test("dispatch par type", () => {
    expect(parseValueByType("12/03/2024", "date")).toBe("2024-03-12");
    expect(parseValueByType("  42  unités", "number")).toBe("42");
    expect(parseValueByType("  Dupont   Jean  ", "text")).toBe("Dupont Jean");
    expect(parseValueByType("xxx", "file")).toBe("");
  });
});
