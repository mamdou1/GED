// src/api/destinataireExterne.ts
import api from "./axios";
import { DestinataireExterne } from "../interfaces/destinataireExterne";

export const getDestinatairesExternes = async (): Promise<DestinataireExterne[]> => {
  const response = await api.get("/destinataire-externe");
  return response.data.data;
};

export const getDestinataireExterneById = async (id: number): Promise<DestinataireExterne> => {
  const response = await api.get(`/destinataire-externe/${id}`);
  return response.data.data;
};

export const createDestinataireExterne = async (data: Partial<DestinataireExterne>): Promise<DestinataireExterne> => {
  const response = await api.post("/destinataire-externe", data);
  return response.data.data;
};

export const updateDestinataireExterne = async (id: number, data: Partial<DestinataireExterne>): Promise<DestinataireExterne> => {
  const response = await api.put(`/destinataire-externe/${id}`, data);
  return response.data.data;
};

export const deleteDestinataireExterne = async (id: number): Promise<void> => {
  await api.delete(`/destinataire-externe/${id}`);
};