import { computePrefill, Suggestion } from "../scanPrefill";

const suggestions: Suggestion[] = [
  { fieldId: 10, label: "Numéro", fieldType: "text", value: "ABC-123", confidence: "high" },
  { fieldId: 11, label: "Date", fieldType: "date", value: "2024-03-12", confidence: "high" },
];

test("ne pré-remplit que les champs vides", () => {
  const formValues = { "5_11": "déjà saisi" }; // champ 11 déjà rempli
  const updates = computePrefill(5, suggestions, formValues);
  expect(updates).toEqual([{ fieldId: 10, value: "ABC-123" }]);
});

test("pré-remplit tout si formulaire vide", () => {
  const updates = computePrefill(5, suggestions, {});
  expect(updates).toEqual([
    { fieldId: 10, value: "ABC-123" },
    { fieldId: 11, value: "2024-03-12" },
  ]);
});

test("traite une valeur d'espaces comme vide", () => {
  const updates = computePrefill(5, suggestions, { "5_10": "   " });
  expect(updates.map((u) => u.fieldId)).toContain(10);
});
