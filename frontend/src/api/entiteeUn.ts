import api from "./axios";
import type { Fonction, EntiteeUn, TypeDocument } from "../interfaces";
import { types } from "util";

const API_URL = "/entiteeUn";

export const getAllEntiteeUn = async (): Promise<{
  entiteeUn: EntiteeUn[];
}> => {
  try {
    const response = await api.get(`${API_URL}/`, { audit: true });
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getAllEntiteeUn:", error);
    throw error;
  }
};

// Mettre à jour le titre de EntiteeUn
export const updateEntiteeUnTitre = async (
  titre: string,
): Promise<{ titre: string }> => {
  const response = await api.put(`${API_URL}/titre`, { titre });
  return response.data;
};

export const getEntiteeUnTitre = async (): Promise<{ titre: string }> => {
  const response = await api.get(`${API_URL}/titre`);
  return response.data;
};

export const createEntiteeUn = async (
  payload: Partial<EntiteeUn>,
): Promise<EntiteeUn> => {
  const response = await api.post(`${API_URL}/`, payload);
  return response.data;
};

// export const createEntiteeUnTitre = async (
//   payload: Partial<EntiteeUn>,
// ): Promise<EntiteeUn> => {
//   const response = await api.post(`${API_URL}/`, payload);
//   return response.data;
// };

export const getFunctionsByEntiteeUn = async (
  id: number,
): Promise<Fonction[]> => {
  const response = await api.get(`${API_URL}/${id}/fonctions`);
  return response.data;
};

export const updateEntiteeUnById = async (
  id: number,
  payload: Partial<EntiteeUn>,
): Promise<EntiteeUn> => {
  const response = await api.put(`${API_URL}/${id}`, payload);
  return response.data;
};

export const deleteEntiteeUnById = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};

export const deleteEntiteeUnTitre = async (): Promise<{
  message: string;
  count: number;
}> => {
  try {
    const response = await api.delete(`${API_URL}/titre`); // Sans ID
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur deleteAllEntiteeTroisTitres:", error);
    throw error;
  }
};

export const getTypesOfEntiteeUn = async (
  entiteeUnId: number,
): Promise<TypeDocument[]> => {
  const response = await api.get(`${API_URL}/${entiteeUnId}/types`);
  return response.data;
};

// Ajouter des types de documents à une direction
export const addTypesToEntiteeUn = async (
  entiteeUnId: number,
  typeIds: number[],
): Promise<void> => {
  await api.post(`${API_URL}/${entiteeUnId}/types`, { typeIds });
};

// Retirer des types de documents d'une direction
export const removeTypesFromEntiteeUn = async (
  entiteeUnId: number,
  typeIds: number[],
): Promise<void> => {
  await api.delete(`${API_URL}/${entiteeUnId}/types`, { data: { typeIds } });
};
