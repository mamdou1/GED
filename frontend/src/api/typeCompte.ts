// src/api/typeCompte.ts
import api from "./axios";
import {
  TypeCompte,
  TypeCompteCreatePayload,
  TypeCompteUpdatePayload,
} from "../interfaces/index";

/**
 * Récupérer tous les types de compte (avec pagination et filtres)
 */
export const getTypeComptes = async (params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data: TypeCompte[];
  total: number;
  limit: number;
  offset: number;
}> => {
  const { data } = await api.get("/type-compte", { params });
  return data;
};

/**
 * Récupérer un type de compte par ID
 */
export const getTypeCompteById = async (
  id: number,
): Promise<{ success: boolean; data: TypeCompte }> => {
  const { data } = await api.get(`/type-compte/${id}`);
  return data;
};

/**
 * Créer un type de compte
 */
export const createTypeCompte = async (
  payload: TypeCompteCreatePayload,
): Promise<{ success: boolean; message: string; data: TypeCompte }> => {
  const { data } = await api.post("/type-compte", payload);
  return data;
};

/**
 * Mettre à jour un type de compte
 */
export const updateTypeCompte = async (
  id: number,
  payload: TypeCompteUpdatePayload,
): Promise<{ success: boolean; message: string; data: TypeCompte }> => {
  const { data } = await api.put(`/type-compte/${id}`, payload);
  return data;
};

/**
 * Supprimer un type de compte
 */
export const deleteTypeCompte = async (
  id: number,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/type-compte/${id}`);
  return data;
};
