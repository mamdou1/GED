const request = require("supertest");
const { createApp } = require("../src/server");

const app = createApp({ mock: true, origin: "http://localhost:4000" });

describe("agent server (mock)", () => {
  test("GET /health -> ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /scan -> pdf + texte", async () => {
    const res = await request(app).post("/scan").send({});
    expect(res.status).toBe(200);
    expect(res.body.ocrText).toContain("Numéro de pièce");
    expect(res.body.pdfBase64.length).toBeGreaterThan(0);
  });

  test("CORS autorise l'origine configurée", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:4000");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:4000");
  });
});
