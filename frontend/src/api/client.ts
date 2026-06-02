import api from "./axios";
import {
  Client,
  ClientCreatePayload,
  ClientUpdatePayload,
} from "../interfaces/index";

export const getClients = async (params?: {
  search?: string;
  conserne?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data: Client[];
  total: number;
  limit: number;
  offset: number;
}> => {
  const { data } = await api.get("/clients", { params });
  return data;
};

export const getClientById = async (
  id: number,
): Promise<{ success: boolean; data: Client }> => {
  const { data } = await api.get(`/clients/${id}`);
  return data;
};

export const createClient = async (
  payload: ClientCreatePayload,
): Promise<{ success: boolean; message: string; data: Client }> => {
  const { data } = await api.post("/clients", payload);
  return data;
};

export const updateClient = async (
  id: number,
  payload: ClientUpdatePayload,
): Promise<{ success: boolean; message: string; data: Client }> => {
  const { data } = await api.put(`/clients/${id}`, payload);
  return data;
};

export const deleteClient = async (
  id: number,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/clients/${id}`);
  return data;
};

export const getTypesDocumentByClient = async (clientId: number) => {
  const { data } = await api.get(`/clients/${clientId}/types-document`);
  return data.data || data;
};
