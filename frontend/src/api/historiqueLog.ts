import api from "./axios";
import type { HistoriqueLog } from "../interfaces/index";

export async function getHistoriqueLogs(params?: {
  page?: number;
  limit?: number;
  agent_id?: number;
  action?: string;
  resource?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{ data: HistoriqueLog[]; pagination: any }> {
  const response = await api.get("/historique", { params });
  return response.data;
}

export async function getHistoriqueLogById(id: number): Promise<HistoriqueLog> {
  const response = await api.get(`/historique/${id}`);
  return response.data;
}
