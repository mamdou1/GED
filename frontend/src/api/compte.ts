// src/api/compte.ts
import api from "./axios";
import {
  Compte,
  CompteCreatePayload,
  CompteUpdatePayload,
} from "../interfaces/index";

/**
 * Récupérer tous les comptes (avec pagination et filtres)
 */
export const getComptes = async (params?: {
  search?: string;
  type_compte_id?: number;
  client_id?: number;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data: Compte[];
  total: number;
  limit: number;
  offset: number;
}> => {
  const { data } = await api.get("/compte", { params });
  return data;
};

/**
 * Récupérer un compte par ID
 */
export const getCompteById = async (
  id: number,
): Promise<{ success: boolean; data: Compte }> => {
  const { data } = await api.get(`/compte/${id}`);
  return data;
};

/**
 * Récupérer les documents types associés à un compte
 */
export const getTypeDocumentsByCompte = async (
  id: number,
): Promise<{ success: boolean; data: TypeDocument[] }> => {
  const { data } = await api.get(`/compte/${id}/type-documents`);
  return data;
};

/**
 * Récupérer les comptes d'un client
 */
export const getComptesByClient = async (
  clientId: number,
): Promise<{ success: boolean; data: Compte[] }> => {
  const { data } = await api.get(`/compte/client/${clientId}`);
  return data;
};

/**
 * Créer un compte
 */
export const createCompte = async (
  payload: CompteCreatePayload,
): Promise<{ success: boolean; message: string; data: Compte }> => {
  const { data } = await api.post("/compte", payload);
  return data;
};

/**
 * Mettre à jour un compte
 */
export const updateCompte = async (
  id: number,
  payload: CompteUpdatePayload,
): Promise<{ success: boolean; message: string; data: Compte }> => {
  const { data } = await api.put(`/compte/${id}`, payload);
  return data;
};

/**
 * Supprimer un compte
 */
export const deleteCompte = async (
  id: number,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/compte/${id}`);
  return data;
};
