// frontend/src/pages/Document/scanPrefill.ts
export type Suggestion = {
  fieldId: number;
  label: string;
  fieldType: string;
  value: string;
  confidence: "high" | "low";
};

export type PrefillUpdate = { fieldId: number; value: string };

// Renvoie les valeurs à appliquer, en ignorant les champs déjà renseignés
// (la clé d'état est `${pieceId}_${fieldId}`).
export function computePrefill(
  pieceId: number,
  suggestions: Suggestion[],
  formValues: Record<string, any>,
): PrefillUpdate[] {
  const updates: PrefillUpdate[] = [];
  for (const s of suggestions || []) {
    if (!s.value) continue;
    const key = `${pieceId}_${s.fieldId}`;
    const current = formValues[key];
    const isEmpty = current === undefined || current === null || String(current).trim() === "";
    if (isEmpty) updates.push({ fieldId: s.fieldId, value: s.value });
  }
  return updates;
}
