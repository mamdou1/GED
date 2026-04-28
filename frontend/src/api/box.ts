import api from "./axios";

// ------------------- BOX -------------------
export const createBox = async (payload: any) => {
  const { data } = await api.post("/box", payload);
  return data;
};

export const updateBox = async (id: string, payload: any) => {
  const { data } = await api.put(`/box/${id}`, payload);
  return data;
};

export const getBoxes = async () => {
  const { data } = await api.get("/box");
  return data;
};

export const getBoxById = async (id: string) => {
  const { data } = await api.get(`/box/${id}`);
  return data;
};

export const deleteBox = async (id: string) => {
  const { data } = await api.delete(`/box/${id}`);
  return data;
};

export const getDocumentsByBox = async (boxId: string) => {
  const { data } = await api.get(`/box/${boxId}/document`);
  return data;
};

export const addDocumentToBox = async (boxId: string, documentId: string) => {
  const { data } = await api.post(`/box/${boxId}/add/${documentId}`);
  return data;
};

export const retireDocumentFromBox = async (
  boxId: string,
  documentId: string,
) => {
  const { data } = await api.post(`/box/${boxId}/remove/${documentId}`);
  return data;
};

// Déplacer un document d'un box à un autre
export const moveDocumentToBox = async (
  documentId: string,
  sourceBoxId: string,
  destinationBoxId: string,
) => {
  const response = await api.post(`/box/${sourceBoxId}/move/${documentId}`, {
    destinationBoxId,
  });
  return response.data;
};
