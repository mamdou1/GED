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


// api/metaField.ts (ajouter ces fonctions)

// ==================== SERVICES POUR LES SURCHARGES ====================

// Récupérer les champs avec surcharges pour une entité spécifique
export const getMetaFieldsForEntity = async (
  typeId: number,
  entityType: string,
  entityId: number
): Promise<any[]> => {
  const response = await api.get(`/meta-fields/${typeId}/entity/${entityType}/${entityId}`);
  return response.data.data;
};

// Récupérer TOUS les champs (base + personnalisés) pour une entité
export const getAllFieldsForEntity = async (
  typeId: number,
  entityType: string,
  entityId: number
): Promise<any[]> => {
  const response = await api.get(`/meta-fields/${typeId}/entity/${entityType}/${entityId}/all`);
  return response.data.data;
};

// Créer ou mettre à jour une surcharge pour un champ de base
export const setMetaFieldOverride = async (
  typeId: number,
  metaFieldId: number,
  entityType: string,
  entityId: number,
  overrideData: any
): Promise<any> => {
  const response = await api.post(
    `/meta-fields/${typeId}/meta-field/${metaFieldId}/override`,
    { entityType, entityId, ...overrideData }
  );
  return response.data.data;
};

// Supprimer une surcharge
export const removeMetaFieldOverride = async (
  typeId: number,
  metaFieldId: number,
  entityType: string,
  entityId: number
): Promise<void> => {
  await api.delete(`/meta-fields/${typeId}/meta-field/${metaFieldId}/override`, {
    data: { entityType, entityId },
  });
};

// ==================== SERVICES POUR LES CHAMPS PERSONNALISÉS ====================

// Ajouter un champ personnalisé
export const addCustomField = async (
  typeId: number,
  entityType: string,
  entityId: number,
  fieldData: any
): Promise<any> => {
  const response = await api.post(
    `/meta-fields/${typeId}/entity/${entityType}/${entityId}/custom`,
    fieldData
  );
  return response.data.data;
};

// Modifier un champ personnalisé
export const updateCustomField = async (
  typeId: number,
  entityType: string,
  entityId: number,
  fieldId: number,
  fieldData: any
): Promise<any> => {
  const response = await api.put(
    `/meta-fields/${typeId}/entity/${entityType}/${entityId}/custom/${fieldId}`,
    fieldData
  );
  return response.data.data;
};

// Supprimer un champ personnalisé
export const deleteCustomField = async (
  typeId: number,
  entityType: string,
  entityId: number,
  fieldId: number
): Promise<void> => {
  await api.delete(`/meta-fields/${typeId}/entity/${entityType}/${entityId}/custom/${fieldId}`);
};

// Masquer/Afficher un champ personnalisé
export const toggleCustomFieldHide = async (
  typeId: number,
  entityType: string,
  entityId: number,
  fieldId: number,
  hidden: boolean
): Promise<any> => {
  const response = await api.put(
    `/meta-fields/${typeId}/entity/${entityType}/${entityId}/custom/${fieldId}/toggle-hide`,
    { hidden }
  );
  return response.data.data;
};