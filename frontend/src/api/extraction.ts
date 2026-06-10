// frontend/src/api/extraction.ts
import api from "./axios";
import type { Suggestion } from "../pages/Document/scanPrefill";

export async function suggestPieceFields(
  pieceId: number,
  ocrText: string,
): Promise<Suggestion[]> {
  const res = await api.post(`/extraction/pieces/${pieceId}/suggest`, {
    ocrText,
  });
  return (res.data?.suggestions || []) as Suggestion[];
}
