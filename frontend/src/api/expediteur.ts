// src/api/expediteur.ts
import api from "./axios";
import { Expediteur } from "../interfaces/expediteur";

export type CreateExpediteurPayload = {
  type: "PERSONNE" | "STRUCTURE";
  nom: string | null;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
};

export const getExpediteurs = async (): Promise<Expediteur[]> => {
  const response = await api.get("/expediteur");
  return response.data.data;
};

export const getExpediteurById = async (id: number): Promise<Expediteur> => {
  const response = await api.get(`/expediteur/${id}`);
  return response.data.data;
};

export const createExpediteur = async (data: CreateExpediteurPayload): Promise<Expediteur> => {
  const response = await api.post("/expediteur", data);
  return response.data.data;
};

export const updateExpediteur = async (id: number, data: Partial<CreateExpediteurPayload>): Promise<Expediteur> => {
  const response = await api.put(`/expediteur/${id}`, data);
  return response.data.data;
};

export const deleteExpediteur = async (id: number): Promise<void> => {
  await api.delete(`/expediteur/${id}`);
};