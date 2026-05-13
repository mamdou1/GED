// hooks/useEntiteeUn.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllEntiteeUn,
  createEntiteeUn,
  updateEntiteeUnById,
  deleteEntiteeUnById,
  getFunctionsByEntiteeUn,
  getEntiteeUnTitre,
  updateEntiteeUnTitre,
  removeTypesFromEntiteeUn,
  addTypesToEntiteeUn,
  getTypesOfEntiteeUn,
} from "../api/entiteeUn";
import type { EntiteeUn, Fonction } from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const entiteeUnKeys = {
  all: ["entiteeUn"] as const,
  lists: () => [...entiteeUnKeys.all, "list"] as const,
  list: (filters: string) => [...entiteeUnKeys.lists(), filters] as const,
  details: () => [...entiteeUnKeys.all, "detail"] as const,
  detail: (id: number | string) => [...entiteeUnKeys.details(), id] as const,
  fonctions: (id: number | string) =>
    [...entiteeUnKeys.detail(id), "fonctions"] as const,
  titre: () => [...entiteeUnKeys.all, "titre"] as const,
  types: (id: number | string) =>
    [...entiteeUnKeys.detail(id), "types"] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer toutes les entités de niveau 1
// hooks/useEntiteeUn.ts - Ajoutez ces logs
export const useEntiteeUn = () => {
  return useQuery({
    queryKey: entiteeUnKeys.lists(),
    queryFn: async (): Promise<EntiteeUn[]> => {
      try {
        const response = await getAllEntiteeUn();

        let result: EntiteeUn[] = [];
        if (Array.isArray(response)) {
          result = response;
        } else if (response && Array.isArray(response.entiteeUn)) {
          result = response.entiteeUn;
        } else {
          console.log("⚠️ [useEntiteeUn] Format inattendu:", response);
        }

        return result;
      } catch (error) {
        console.error("❌ [useEntiteeUn] Erreur API:", error);
        throw error;
      }
    },
  });
};

// Récupérer une entité spécifique
export const useEntiteeUnById = (id: number | string | null) => {
  return useQuery({
    queryKey: entiteeUnKeys.detail(id!),
    queryFn: async (): Promise<EntiteeUn | null> => {
      const response = await getAllEntiteeUn();
      const entitees = response.entiteeUn || [];
      return (
        entitees.find((e: EntiteeUn) => String(e.id) === String(id)) || null
      );
    },
    enabled: !!id,
  });
};

// Récupérer les fonctions d'une entité
export const useFonctionsByEntiteeUn = (id: number | string | null) => {
  return useQuery({
    queryKey: entiteeUnKeys.fonctions(id!),
    queryFn: async (): Promise<Fonction[]> => {
      if (!id) return [];
      const data = await getFunctionsByEntiteeUn(Number(id));
      return Array.isArray(data) ? data : [];
    },
    enabled: !!id,
  });
};

// Récupérer le titre de l'entité
export const useEntiteeUnTitre = () => {
  return useQuery({
    queryKey: entiteeUnKeys.titre(),
    queryFn: async (): Promise<string> => {
      const response = await getEntiteeUnTitre();
      return response.titre || "Entité 1";
    },
  });
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer une entité
export const useCreateEntiteeUn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEntitee: Partial<EntiteeUn>) => createEntiteeUn(newEntitee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.lists() });
    },
  });
};

// Mettre à jour une entité
export const useUpdateEntiteeUn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EntiteeUn> }) =>
      updateEntiteeUnById(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: entiteeUnKeys.detail(variables.id),
      });
    },
  });
};

// Supprimer une entité
export const useDeleteEntiteeUn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEntiteeUnById(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.lists() });
      queryClient.removeQueries({
        queryKey: entiteeUnKeys.detail(deletedId),
      });
    },
  });
};

// Mettre à jour le titre
export const useUpdateEntiteeUnTitre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (titre: string) => updateEntiteeUnTitre(titre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeUnKeys.titre() });
    },
  });
};

export const useEntiteeUnTypes = (entiteeUnId?: number) => {
  return useQuery({
    queryKey: entiteeUnKeys.types(entiteeUnId!),
    queryFn: () => getTypesOfEntiteeUn(entiteeUnId!),
    enabled: !!entiteeUnId,
  });
};

// Hook pour ajouter des types de documents à une direction
export const useAddTypesToEntiteeUn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entiteeUnId,
      typeIds,
    }: {
      entiteeUnId: number;
      typeIds: number[];
    }) => addTypesToEntiteeUn(entiteeUnId, typeIds),
    onSuccess: (_, { entiteeUnId }) => {
      queryClient.invalidateQueries({
        queryKey: entiteeUnKeys.list(String(entiteeUnId)),
      });
      queryClient.invalidateQueries({ queryKey: ["entiteeUns"] });
    },
  });
};

// Hook pour retirer des types de documents d'une direction
export const useRemoveTypesFromEntiteeUn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entiteeUnId,
      typeIds,
    }: {
      entiteeUnId: number;
      typeIds: number[];
    }) => removeTypesFromEntiteeUn(entiteeUnId, typeIds),
    onSuccess: (_, { entiteeUnId }) => {
      queryClient.invalidateQueries({
        queryKey: entiteeUnKeys.list(String(entiteeUnId)),
      });
      queryClient.invalidateQueries({ queryKey: ["entiteeUns"] });
    },
  });
};
