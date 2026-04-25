import api from "./axios";

// ------------------- Trave -------------------
export const createTrave = async (payload: any) => {
  const { data } = await api.post("/trave", payload);
  return data;
};

export const getTraves = async () => {
  const { data } = await api.get("/trave");
  return data;
};

export const getTraveById = async (id: string) => {
  const { data } = await api.get(`/trave/${id}`);
  return data;
};

export const updateTrave = async (id: string, payload: any) => {
  const { data } = await api.put(`/trave/${id}`, payload);
  return data;
};

export const deleteTrave = async (id: string) => {
  const { data } = await api.delete(`/trave/${id}`);
  return data;
};

export const getBoxesByTrave = async (traveId: string) => {
  const { data } = await api.get(`/trave/${traveId}/box`);
  return data;
};

export const addBoxToTrve = async (traveId: string) => {
  const { data } = await api.post(`/box/${traveId}/add`);
  return data;
};

export const retireBoxToTrve = async (traveId: string) => {
  const { data } = await api.post(`/box/${traveId}/remove`);
  return data;
};
