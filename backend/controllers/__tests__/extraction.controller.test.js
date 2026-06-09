jest.mock("../../models", () => ({
  PieceMetaField: { findAll: jest.fn() },
}));

const { PieceMetaField } = require("../../models");
const { suggestForPiece } = require("../extraction.controller");

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

describe("suggestForPiece", () => {
  beforeEach(() => jest.clearAllMocks());

  test("400 si ocrText manquant", async () => {
    const res = mockRes();
    await suggestForPiece({ params: { pieceId: "1" }, body: {} }, res);
    expect(res.statusCode).toBe(400);
  });

  test("renvoie les suggestions issues des champs de la pièce", async () => {
    PieceMetaField.findAll.mockResolvedValue([
      { id: 10, label: "Numéro de pièce", field_type: "text", extraction_keywords: null, extraction_pattern: null },
      { id: 11, label: "Pièce jointe", field_type: "file", extraction_keywords: null, extraction_pattern: null },
    ]);
    const res = mockRes();
    await suggestForPiece(
      { params: { pieceId: "1" }, body: { ocrText: "Numéro de pièce : ABC-12345" } },
      res,
    );
    expect(PieceMetaField.findAll).toHaveBeenCalledWith({
      where: { piece_id: "1" },
      order: [["position", "ASC"]],
    });
    expect(res.body).toEqual({
      suggestions: [
        { fieldId: 10, label: "Numéro de pièce", fieldType: "text", value: "ABC-12345", confidence: "high" },
      ],
    });
  });
});
