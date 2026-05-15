import api from "./axios";
import type {
  TypeDocument,
  CreateTypeDocumentPayload,
  AddPiecesToTypeDocumentPayload,
  Pieces,
} from "../interfaces";

export const createTypeDocument = async (
  payload: CreateTypeDocumentPayload,
): Promise<TypeDocument> => {
  console.log("📤 createTypeDocument:", payload);
  const response = await api.post("/types-documents", payload);
  return response.data.type || response.data;
};

export const getTypeDocuments = async (): Promise<{
  typeDocument: TypeDocument[];
}> => {
  const response = await api.get("/types-documents");
  // On s'assure de renvoyer la structure attendue par le state React
  return response.data;
};

export const getTypeDocumentById = async (
  id: string,
): Promise<TypeDocument> => {
  const response = await api.get(`/types-documents/${id}`);
  // Gestion du nesting : vérifie si c'est dans .type ou à la racine
  return response.data.type || response.data;
};

export const updateTypeDocument = async (
  id: string,
  payload: Partial<TypeDocument>, // Utilise Partial pour permettre de n'envoyer que certains champs
): Promise<any> => {
  console.log("📤 createTypeDocument:", payload);
  const response = await api.put(`/types-documents/${id}`, payload);
  return response.data;
};

export const deleteTypeDocument = async (id: string): Promise<void> => {
  await api.delete(`/types-documents/${id}`);
};

export const addPiecesToTypeDocument = async (
  document_typeId: string,
  payload: AddPiecesToTypeDocumentPayload,
): Promise<{ message: string }> => {
  const response = await api.post(
    `/types-documents/${document_typeId}/pieces`,
    payload,
  );
  return response.data;
};

export const removePiecesFromTypeDocument = async (
  document_typeId: string,
  pieceId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(
    `/types-documents/${document_typeId}/pieces`,
    { data: { pieceId } },
  );
  return response.data;
};

export const getPiecesOfTypeDocument = async (
  document_typeId: string,
): Promise<any[]> => {
  const response = await api.get(`/types-documents/${document_typeId}/pieces`);
  return response.data;
};

// Ajouter une pièce spécifique à une entité
export const addPieceToEntityTypeDocument = async (
  typeDocumentId: string,
  payload: EntityPiecePayload,
): Promise<{ message: string }> => {
  const response = await api.post(
    `/types-documents/${typeDocumentId}/entity-pieces/add`,
    payload,
  );

  return response.data;
};

// Retirer une pièce spécifique à une entité
export const removePieceFromEntityTypeDocument = async (
  typeDocumentId: string,
  payload: EntityPiecePayload,
): Promise<{ message: string }> => {
  const response = await api.post(
    `/types-documents/${typeDocumentId}/entity-pieces/remove`,
    payload,
  );

  return response.data;
};

export const getEffectivePiecesForEntity = async (
  typeDocumentId: string,
  entityType: string,
  entityId: number,
): Promise<{
  basePieces: Pieces[];
  addedPieces: Pieces[];
  removedPieceIds: number[];
}> => {
  const response = await api.get(
    `/types-documents/${typeDocumentId}/entity-pieces/${entityType}/${entityId}`,
  );
  return response.data;
};
