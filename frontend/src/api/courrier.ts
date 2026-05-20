// src/api/courrier.ts
import api from "./axios";
import { Courrier, CourrierCreatePayload } from "../interfaces/courrier";

export const getCourriers = async (params?: any): Promise<Courrier[]> => {
  const { data } = await api.get("/courrier", { params });
  return data.data || data;
};

export const getCourrierById = async (id: number): Promise<Courrier> => {
  const { data } = await api.get(`/courrier/${id}`);
  return data.data || data;
};

export const getMesAttribues = async (): Promise<Courrier[]> => {
  const { data } = await api.get("/courrier/mes-attribues");
  return data.data || data;
};

export const createCourrier = async (payload: CourrierCreatePayload) => {
  const { data } = await api.post("/courrier", payload);
  return data;
};

export const validerCourrier = async (id: number) => {
  const { data } = await api.patch(`/courrier/${id}/valider`);
  return data;
};

export const rejeterCourrier = async (id: number, motif: string) => {
  const { data } = await api.patch(`/courrier/${id}/rejeter`, { motif });
  return data;
};

export const attribuerCourrier = async (id: number, payload: any) => {
  const { data } = await api.post(`/courrier/${id}/attribuer`, payload);
  return data;
};

// Attribution à une entité
export const attribuerCourrierAEntite = async (
  id: number,
  payload: { entiteeId: number; entiteeType: string; motif?: string },
) => {
  const { data } = await api.post(`/courrier/${id}/attribuer-entite`, payload);
  return data;
};

export const traiterCourrier = async (id: number, payload: any) => {
  const { data } = await api.post(`/courrier/${id}/traiter`, payload);
  return data;
};

export const transfererCourrier = async (id: number, payload: any) => {
  const { data } = await api.post(`/courrier/${id}/transferer`, payload);
  return data;
};

export const addPiecesJointes = async (id: number, files: File[]) => {
  console.log(
    "📡 addPiecesJointes - URL:",
    `/courrier-files/courrier/${id}/files`,
  );
  console.log("📡 addPiecesJointes - Nombre de fichiers:", files.length);

  const formData = new FormData();
  files.forEach((file) => {
    console.log("   - Ajout fichier:", file.name, file.type, file.size);
    formData.append("files", file);
  });

  const { data } = await api.post(
    `/courrier-files/courrier/${id}/files`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  console.log("📡 addPiecesJointes - Réponse:", data);
  return data;
};

// ⭐ NOUVELLES FONCTIONS pour la gestion des pièces jointes

// Récupérer toutes les pièces jointes d'un courrier
export const getPiecesJointes = async (courrierId: number) => {
  const { data } = await api.get(
    `/courrier-files/courrier/${courrierId}/files`,
  );
  return data;
};

// Supprimer une pièce jointe
export const deletePieceJointe = async (courrierId: number, fileId: number) => {
  const { data } = await api.delete(
    `/courrier-files/courrier/${courrierId}/file/${fileId}`,
  );
  return data;
};

// Télécharger une pièce jointe
export const downloadPieceJointe = async (
  fileId: number,
  fileName?: string,
) => {
  const response = await api.get(
    `/courrier-files/courrier/file/${fileId}/download`,
    {
      responseType: "blob",
    },
  );

  // Créer un lien de téléchargement
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName || `fichier_${fileId}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return response;
};

// Obtenir l'URL pour aperçu
export const getPieceJointeUrl = (fileId: number): string => {
  return `/courrier-files/courrier/file/${fileId}/download`;
};

export const deleteCourrier = async (id: number) => {
  const { data } = await api.delete(`/courrier/${id}`);
  return data;
};
