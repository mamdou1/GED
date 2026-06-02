import api from "./axios";
import type {
  TypeDocument,
  CreateTypeDocumentPayload,
  AddPiecesToTypeDocumentPayload,
  Pieces,
} from "../interfaces";

// ✅ AJOUT DE L'INTERFACE MANQUANTE
export interface EntityPiecePayload {
  entity_type: string;
  entity_id: number;
  piece_id: number;
}

export const createTypeDocument = async (
  payload: CreateTypeDocumentPayload,
): Promise<TypeDocument> => {
  console.log("📤 createTypeDocument:", payload);
  const response = await api.post("/types-documents", payload);
  return response.data.type || response.data;
};

export const getTypeDocuments = async (): Promise<TypeDocument[]> => {
  const response = await api.get("/types-documents");

  // ✅ CORRECTION : Gère les différents formats possibles
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray(response.data.typeDocument)) {
    return response.data.typeDocument;
  }
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  console.warn("⚠️ Format de réponse inattendu:", response.data);
  return [];
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

/**
 * ✅ Récupérer les types de documents avec conserne non null
 */
export const getTypesWithConserne = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data: TypeDocument[];
  total: number;
  limit: number;
  offset: number;
}> => {
  const { data } = await api.get("/types-documents/with-conserne", { params });
  return data;
};

/**
 * ✅ Affecter un type de compte à un type de document
 */
export const assignTypeCompteToTypeDocument = async (
  typeDocumentId: number,
  typeCompteId: number | null,
): Promise<{ success: boolean; message: string; data: TypeDocument }> => {
  const { data } = await api.put(
    `/types-documents/${typeDocumentId}/assign-type-compte`,
    {
      type_compte_id: typeCompteId,
    },
  );
  return data;
};
