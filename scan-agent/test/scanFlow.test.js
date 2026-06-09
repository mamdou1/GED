const path = require("path");
const { runScanFlow } = require("../src/scanFlow");

describe("runScanFlow (mock)", () => {
  test("renvoie pdfBase64 + ocrText depuis les fixtures", async () => {
    const out = await runScanFlow({ mock: true });
    expect(out.ocrText).toContain("Numéro de pièce");
    expect(typeof out.pdfBase64).toBe("string");
    expect(out.pdfBase64.length).toBeGreaterThan(0);
    // base64 décodable
    expect(Buffer.from(out.pdfBase64, "base64").toString("utf8")).toContain("%PDF");
    expect(out.pages).toBeGreaterThanOrEqual(1);
  });
});
