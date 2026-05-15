//entiteeDeuxId
import api from "./axios";
import type { Fonction, EntiteeTrois, TypeDocument } from "../interfaces";

const API_URL = "/entiteeTrois";

export const getAllEntiteeTrois = async (): Promise<{
  entiteeTrois: EntiteeTrois[];
}> => {
  try {
    const response = await api.get(`${API_URL}/`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getAllEntiteeTrois:", error);
    throw error;
  }
};

export const getEntiteeTroisByEntiteeDeux = async (
  entiteeDeuxId: number,
): Promise<EntiteeTrois[]> => {
  try {
    const response = await api.get(
      `${API_URL}/by-entiteeTrois/${entiteeDeuxId}`,
    );
    return response.data; // ✅ directement un tableau
  } catch (error: any) {
    console.error("❌ Erreur getEntiteeTroisByEntiteeDeux:", error);
    throw error;
  }
};

export const updateEntiteeTroisTitre = async (
  titre: string,
): Promise<{ titre: string }> => {
  const response = await api.put(`${API_URL}/titre`, { titre });
  return response.data;
};

export const getEntiteeTroisTitre = async (): Promise<{ titre: string }> => {
  const response = await api.get(`${API_URL}/titre`);
  return response.data;
};

export const createEntiteeTrois = async (
  payload: Partial<EntiteeTrois>,
): Promise<EntiteeTrois> => {
  const response = await api.post(`${API_URL}/`, payload);
  return response.data;
};

export const createEntiteeTroisTitre = async (
  payload: Partial<EntiteeTrois>,
): Promise<EntiteeTrois> => {
  const response = await api.post(`${API_URL}/`, payload);
  return response.data;
};

export const getFunctionsByEntiteeTrois = async (
  id: number,
): Promise<Fonction[]> => {
  const response = await api.get(`${API_URL}/${id}/fonctions`);
  return response.data;
};

export const updateEntiteeTroisById = async (
  id: number,
  payload: Partial<EntiteeTrois>,
): Promise<EntiteeTrois> => {
  const response = await api.put(`${API_URL}/${id}`, payload);
  return response.data;
};

export const deleteEntiteeTroisById = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};

export const deleteEntiteeTroisTitre = async (): Promise<{
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

export const getTypesOfEntiteeTrois = async (
  entiteeTroisId: number,
): Promise<TypeDocument[]> => {
  const response = await api.get(`${API_URL}/${entiteeTroisId}/types`);
  return response.data;
};

// Ajouter des types de documents à une direction
export const addTypesToEntiteeTrois = async (
  entiteeTroisId: number,
  typeIds: number[],
): Promise<void> => {
  await api.post(`${API_URL}/${entiteeTroisId}/types`, { typeIds });
};

// Retirer des types de documents d'une direction
export const removeTypesFromEntiteeTrois = async (
  entiteeTroisId: number,
  typeIds: number[],
): Promise<void> => {
  await api.delete(`${API_URL}/${entiteeTroisId}/types`, {
    data: { typeIds },
  });
};
