import api from "./axios";
import type { User } from "../interfaces";

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/user/");
  return response.data;
};

export const getOnLigneUsers = async (): Promise<User[]> => {
  const response = await api.get("/user/online");
  return response.data;
};

export const getTotalUsers = async (): Promise<{ totalMembres: number }> => {
  const response = await api.get("/user/totalMembre");
  return response.data;
};

export const getGetUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

export const createUser = async (
  payload: Partial<User>,
  photoFile?: File,
): Promise<User> => {
  try {
    const formData = new FormData();

    // Ajouter les champs texte
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    // Ajouter la photo si présente
    if (photoFile) {
      formData.append("photoProfil", photoFile);
    }

    const response = await api.post("/user/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.user || response.data;
  } catch (error: any) {
    console.error("❌ Erreur API createUser:", error);
    throw error;
  }
};

/**
 * ✅ Mettre à jour un utilisateur (ADMIN) avec photo
 */
export const updateUser = async (
  payload: Partial<User>,
  id: string,
  photoFile?: File,
): Promise<User> => {
  try {
    console.log("📤 Données envoyées pour mise à jour:", { payload, id });

    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
        console.log(`📝 Champ ${key}:`, value);
      }
    });

    if (photoFile) {
      formData.append("photoProfil", photoFile);
      console.log("📷 Fichier photo ajouté");
    }

    const response = await api.put(`/user/update-by-admin/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Réponse mise à jour:", response.data);
    return response.data.user || response.data;
  } catch (error: any) {
    console.error("❌ Erreur détaillée API updateUser:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Headers:", error.response?.headers);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/user/${id}`);
};

export const desactiverUserCompte = async (id: string): Promise<void> => {
  await api.patch(`/user/desable/${id}`);
};

export const activerUserCompte = async (id: string): Promise<void> => {
  await api.patch(`/user/enable/${id}`);
};
