import api from "./axios";
import type {
  MetaField,
  CreateMetaFieldPayload,
  TypeDocument,
} from "../interfaces";

export const getMetaById = async (typeId: string): Promise<MetaField[]> => {
  const response = await api.get(`/meta-fields/${typeId}`);
  return response.data;
};

export const getAllFieldsForEntity = async (
  typeId: number,
  entityType: string,
  entityId: number,
): Promise<MetaFieldWithOverride[]> => {
  console.log(
    "📤 Appel API (all):",
    `/meta-fields/${typeId}/entity/${entityType}/${entityId}/all`,
  );
  const response = await api.get(
    `/meta-fields/${typeId}/entity/${entityType}/${entityId}/all`,
  );
  console.log("📥 Réponse API (all):", response.data);
  return response.data.data;
};

export const createMetaField = async (
  typeId: string,
  payload: CreateMetaFieldPayload,
): Promise<MetaField> => {
  console.log("📤 createMetaField:", payload);
  const response = await api.post(`/meta-fields/${typeId}`, payload);
  return response.data.metaField || response.data;
};

export const updateMetaField = async (
  id: string,
  payload: Partial<CreateMetaFieldPayload>,
): Promise<MetaField> => {
  const response = await api.put(`/meta-fields/${id}`, payload);
  return response.data.metaField || response.data;
};

export const deleteMetaField = async (id: string): Promise<void> => {
  await api.delete(`/meta-fields/${id}`);
};
