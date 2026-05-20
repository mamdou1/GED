import { TypeOutilsConservation } from "../interfaces/index";
import api from "./axios";

export const createType = async (payload: any) => {
  console.log("📤 createTypeOutilsConservation:", payload);
  const { data } = await api.post("/type_outils_conservation", payload); // ✅ Changé de "type-outils-conservation" à "type_outils_conservation"
  return data;
};

export const updateType = async (id: string, payload: any) => {
  const { data } = await api.put(`/type_outils_conservation/${id}`, payload); // ✅ Changé
  return data;
};

export const getAll = async () => {
  const { data } = await api.get("/type_outils_conservation"); // ✅ Changé
  return data;
};

export const getByID = async (id: string, payload: any) => {
  const { data } = await api.get(`/type_outils_conservation/${id}`); // ✅ Changé
  return data;
};

export const deleteType = async (id: string) => {
  // ✅ Retiré payload inutilisé
  const { data } = await api.delete(`/type_outils_conservation/${id}`); // ✅ Changé
  return data;
};
