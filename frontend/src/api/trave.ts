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

export const addBoxToTrave = async (boxId: string, traveId: string) => {
  const { data } = await api.post(`/trave/box/${boxId}/add/${traveId}`);
  return data;
};

export const retireBoxToTrave = async (boxId: string) => {
  const { data } = await api.post(`/trave/box/${boxId}/remove`);
  return data;
};
