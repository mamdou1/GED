// frontend/src/api/scan.ts
// Appels vers l'agent LOCAL (origine différente + pas de JWT) -> fetch direct.
const AGENT_URL =
  process.env.REACT_APP_SCAN_AGENT_URL || "http://127.0.0.1:7777";

export type ScanResult = { pdfBase64: string; ocrText: string; pages: number };

// true si l'agent local répond.
export async function checkScanAgent(): Promise<boolean> {
  try {
    const res = await fetch(`${AGENT_URL}/health`, { method: "GET" });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}

export async function scanDocument(
  opts: { profile?: string; lang?: string } = {},
): Promise<ScanResult> {
  const res = await fetch(`${AGENT_URL}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Échec du scan");
  }
  return res.json();
}

// Convertit un PDF base64 en File (pour l'attacher au champ fichier).
export function base64ToPdfFile(base64: string, filename: string): File {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: "application/pdf" });
}
