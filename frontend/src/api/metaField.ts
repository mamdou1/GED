import api from "./axios";
import type { MetaField, CreateMetaFieldPayload } from "../interfaces";

export const getMetaById = async (typeId: string): Promise<MetaField[]> => {
  const response = await api.get(`/meta-fields/${typeId}`);
  return response.data;
};

// ✅ UNE SEULE déclaration (avec le bon typage)
export const getAllFieldsForEntity = async (
  typeId: number,
  entityType: string,
  entityId: number,
): Promise<any[]> => {
  console.log("📤 Appel API (all):", `/meta-fields/${typeId}/entity/${entityType}/${entityId}/all`);
  const response = await api.get(`/meta-fields/${typeId}/entity/${entityType}/${entityId}/all`);
  console.log("📥 Réponse API (all):", response.data);
  return response.data.data;
};

export const createMetaField = async (
  typeId: string,
  payload: CreateMetaFieldPayload,
): Promise<MetaField> => {
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

// ==================== SERVICES POUR LES SURCHARGES ====================

export const getMetaFieldsForEntity = async (
  typeId: number,
  entityType: string,
  entityId: number,
): Promise<any[]> => {
  const response = await api.get(`/meta-fields/${typeId}/entity/${entityType}/${entityId}`);
  return response.data.data;
};

export const setMetaFieldOverride = async (
  typeId: number,
  metaFieldId: number,
  entityType: string,
  entityId: number,
  overrideData: any,
): Promise<any> => {
  const response = await api.post(
    `/meta-fields/${typeId}/meta-field/${metaFieldId}/override`,
    { entityType, entityId, ...overrideData },
  );
  return response.data.data;
};

export const removeMetaFieldOverride = async (
  typeId: number,
  metaFieldId: number,
  entityType: string,
  entityId: number,
): Promise<void> => {
  await api.delete(`/meta-fields/${typeId}/meta-field/${metaFieldId}/override`, {
    data: { entityType, entityId },
  });
};

// ==================== SERVICES POUR LES CHAMPS PERSONNALISÉS ====================

export const addCustomField = async (
  typeId: number,
  entityType: string,
  entityId: number,
  fieldData: any,
): Promise<any> => {
  const response = await api.post(
    `/meta-fields/${typeId}/entity/${entityType}/${entityId}/custom`,
    fieldData,
  );
  return response.data.data;
};

export const updateCustomField = async (
  typeId: number,
  entityType: string,
  entityId: number,
  fieldId: number,
  fieldData: any,
): Promise<any> => {
  const response = await api.put(
    `/meta-fields/${typeId}/entity/${entityType}/${entityId}/custom/${fieldId}`,
    fieldData,
  );
  return response.data.data;
};

export const deleteCustomField = async (
  typeId: number,
  entityType: string,
  entityId: number,
  fieldId: number,
): Promise<void> => {
  await api.delete(`/meta-fields/${typeId}/entity/${entityType}/${entityId}/custom/${fieldId}`);
};

export const toggleCustomFieldHide = async (
  typeId: number,
  entityType: string,
  entityId: number,
  fieldId: number,
  hidden: boolean,
): Promise<any> => {
  const response = await api.put(
    `/meta-fields/${typeId}/entity/${entityType}/${entityId}/custom/${fieldId}/toggle-hide`,
    { hidden },
  );
  return response.data.data;
};