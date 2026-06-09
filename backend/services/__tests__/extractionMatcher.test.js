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

const { extractValueForField, suggestFields } = require("../extractionMatcher");

const OCR = [
  "REPUBLIQUE - Ministère",
  "Numéro de pièce : ABC-12345",
  "Date de signature : 12/03/2024",
  "Montant",
  "1 250,50",
  "Nom du signataire",
].join("\n");

describe("extractValueForField", () => {
  test("valeur sur la même ligne après ':' (confiance high)", () => {
    const r = extractValueForField(OCR, {
      label: "Numéro de pièce",
      field_type: "text",
    });
    expect(r).toEqual({ value: "ABC-12345", confidence: "high" });
  });

  test("date parsée vers ISO", () => {
    const r = extractValueForField(OCR, {
      label: "Date de signature",
      field_type: "date",
    });
    expect(r).toEqual({ value: "2024-03-12", confidence: "high" });
  });

  test("valeur sur la ligne suivante (confiance low)", () => {
    const r = extractValueForField(OCR, {
      label: "Montant",
      field_type: "number",
    });
    expect(r).toEqual({ value: "1250.50", confidence: "low" });
  });

  test("recherche insensible aux accents (label sans accent)", () => {
    const r = extractValueForField(OCR, {
      label: "Numero de piece",
      field_type: "text",
    });
    expect(r.value).toBe("ABC-12345");
  });

  test("override extraction_keywords", () => {
    const r = extractValueForField(OCR, {
      label: "Référence",
      field_type: "text",
      extraction_keywords: ["Numéro de pièce"],
    });
    expect(r.value).toBe("ABC-12345");
  });

  test("override extraction_pattern (regex, groupe 1)", () => {
    const r = extractValueForField(OCR, {
      label: "Code",
      field_type: "text",
      extraction_pattern: "pièce\\s*:\\s*([A-Z0-9-]+)",
    });
    expect(r).toEqual({ value: "ABC-12345", confidence: "high" });
  });

  test("null si mot-clé absent", () => {
    expect(
      extractValueForField(OCR, { label: "Inexistant", field_type: "text" }),
    ).toBeNull();
  });
});

describe("suggestFields", () => {
  test("ignore les champs file et ceux sans valeur", () => {
    const fields = [
      { id: 1, label: "Numéro de pièce", field_type: "text" },
      { id: 2, label: "Date de signature", field_type: "date" },
      { id: 3, label: "Pièce jointe", field_type: "file" },
      { id: 4, label: "Inexistant", field_type: "text" },
    ];
    const out = suggestFields(OCR, fields);
    expect(out).toEqual([
      { fieldId: 1, label: "Numéro de pièce", fieldType: "text", value: "ABC-12345", confidence: "high" },
      { fieldId: 2, label: "Date de signature", fieldType: "date", value: "2024-03-12", confidence: "high" },
    ]);
  });
});
