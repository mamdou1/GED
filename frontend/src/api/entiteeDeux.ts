import api from "./axios";
import type { Fonction, EntiteeDeux, TypeDocument } from "../interfaces";

const API_URL = "/entiteeDeux";

export const getAllEntiteeDeux = async (): Promise<{
  entiteeDeux: EntiteeDeux[];
}> => {
  // Changé ici
  try {
    const response = await api.get(`${API_URL}/`);
    return response.data;
    // Note : Si votre backend renvoie { "division": [...] },
    // changez la ligne ci-dessus par : return { divisions: response.data.division };
  } catch (error: any) {
    console.error("❌ Erreur getAllEntiteeDeux:", error);
    throw error;
  }
};

export const getEntiteeDeuxByEntiteeUn = async (
  entiteeUnId: number,
): Promise<{ entiteeDeux: EntiteeDeux[] }> => {
  try {
    const response = await api.get(`${API_URL}/by-entiteeUn/${entiteeUnId}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getEntiteeDeuxByEntiteeUn:", error);
    throw error;
  }
};

export const getEntiteeDeuxTitre = async (): Promise<{ titre: string }> => {
  const response = await api.get(`${API_URL}/titre`);
  return response.data;
};

export const updateEntiteeDeuxTitre = async (
  titre: string,
): Promise<{ titre: string }> => {
  const response = await api.put(`${API_URL}/titre`, { titre });
  return response.data;
};

export const createEntiteeDeux = async (
  payload: Partial<EntiteeDeux>,
): Promise<EntiteeDeux> => {
  const response = await api.post(`${API_URL}/`, payload);
  return response.data;
};

export const createEntiteeDeuxTitre = async (
  payload: Partial<EntiteeDeux>,
): Promise<EntiteeDeux> => {
  const response = await api.post(`${API_URL}/`, payload);
  return response.data;
};

export const getFunctionsByEntiteeDeux = async (
  id: number,
): Promise<Fonction[]> => {
  const response = await api.get(`${API_URL}/${id}/fonctions`);
  return response.data;
};

export const updateEntiteeDeuxById = async (
  id: number,
  payload: Partial<EntiteeDeux>,
): Promise<EntiteeDeux> => {
  const response = await api.put(`${API_URL}/${id}`, payload);
  return response.data;
};

export const deleteEntiteeDeuxById = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};

export const deleteEntiteeDeuxTitre = async (): Promise<{
  message: string;
  count: number;
}> => {
  try {
    const response = await api.delete(`${API_URL}/titre`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur deleteAllEntiteeTroisTitres:", error);
    throw error;
  }
};

export const getTypesOfEntiteeDeux = async (
  entiteeDeuxId: number,
): Promise<TypeDocument[]> => {
  const response = await api.get(`${API_URL}/${entiteeDeuxId}/types`);
  return response.data;
};

// Ajouter des types de documents à une direction
export const addTypesToEntiteeDeux = async (
  entiteeDeuxId: number,
  typeIds: number[],
): Promise<void> => {
  await api.post(`${API_URL}/${entiteeDeuxId}/types`, { typeIds });
};

// Retirer des types de documents d'une direction
export const removeTypesFromEntiteeDeux = async (
  entiteeDeuxId: number,
  typeIds: number[],
): Promise<void> => {
  await api.delete(`${API_URL}/${entiteeDeuxId}/types`, { data: { typeIds } });
};





