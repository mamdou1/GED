// src/api/typeCompteMetafield.ts
import api from "./axios";
import {
  TypeCompteMetaField,
  TypeCompteMetaFieldCreatePayload,
  TypeCompteMetaFieldUpdatePayload,
} from "../interfaces";

export const getTypeCompteMetaFields = async (
  typeId: number,
): Promise<{
  success: boolean;
  data: TypeCompteMetaField[];
  isOriginal?: boolean;
}> => {
  const { data } = await api.get(`/type-compte-meta-field/${typeId}`);
  return data;
};

export const createTypeCompteMetaField = async (
  typeId: number,
  payload: TypeCompteMetaFieldCreatePayload,
): Promise<{ success: boolean; data: TypeCompteMetaField }> => {
  const { data } = await api.post(`/type-compte-meta-field/${typeId}`, payload);
  return data;
};

export const updateTypeCompteMetaField = async (
  id: number,
  payload: TypeCompteMetaFieldUpdatePayload,
): Promise<{ success: boolean }> => {
  const { data } = await api.put(`/type-compte-meta-field/${id}`, payload);
  return data;
};

export const deleteTypeCompteMetaField = async (
  id: number,
): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/type-compte-meta-field/${id}`);
  return data;
};
