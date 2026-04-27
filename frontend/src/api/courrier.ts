// src/api/courrier.ts
import api from "./axios";
import { Courrier, CourrierCreatePayload } from "../interfaces/courrier";

export const getCourriers = async (params?: any): Promise<Courrier[]> => {
  const { data } = await api.get("/courrier", { params });
  return data.data || data;
};

export const getCourrierById = async (id: number): Promise<Courrier> => {
  const { data } = await api.get(`/courrier/${id}`);
  return data.data || data;
};

export const getMesAttribues = async (): Promise<Courrier[]> => {
  const { data } = await api.get("/courrier/mes-attribues");
  return data.data || data;
};

export const createCourrier = async (payload: CourrierCreatePayload) => {
  const { data } = await api.post("/courrier", payload);
  return data;
};

export const validerCourrier = async (id: number) => {
  const { data } = await api.patch(`/courrier/${id}/valider`);
  return data;
};

export const rejeterCourrier = async (id: number, motif: string) => {
  const { data } = await api.patch(`/courrier/${id}/rejeter`, { motif });
  return data;
};

export const attribuerCourrier = async (id: number, payload: any) => {
  const { data } = await api.post(`/courrier/${id}/attribuer`, payload);
  return data;
};

// ⭐ NOUVEAU: Attribution à une entité
export const attribuerCourrierAEntite = async (id: number, payload: { entiteeId: number; entiteeType: string; motif?: string }) => {
  const { data } = await api.post(`/courrier/${id}/attribuer-entite`, payload);
  return data;
};

export const traiterCourrier = async (id: number, payload: any) => {
  const { data } = await api.post(`/courrier/${id}/traiter`, payload);
  return data;
};

export const transfererCourrier = async (id: number, payload: any) => {
  const { data } = await api.post(`/courrier/${id}/transferer`, payload);
  return data;
};

export const addPiecesJointes = async (id: number, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  
  const { data } = await api.post(`/courrier/${id}/pieces-jointes`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteCourrier = async (id: number) => {
  const { data } = await api.delete(`/courrier/${id}`);
  return data;
};