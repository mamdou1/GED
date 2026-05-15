// hooks/useEntiteeDeux.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllEntiteeDeux,
  getEntiteeDeuxByEntiteeUn,
  createEntiteeDeux,
  updateEntiteeDeuxById,
  deleteEntiteeDeuxById,
  getFunctionsByEntiteeDeux,
  getEntiteeDeuxTitre,
  updateEntiteeDeuxTitre,
  addTypesToEntiteeDeux,
  getTypesOfEntiteeDeux,
  removeTypesFromEntiteeDeux,
} from "../api/entiteeDeux";
import type { EntiteeDeux, Fonction } from "../interfaces";
import { entiteeUnKeys } from "./useEntitees";
import { addTypesToEntiteeUn, getTypesOfEntiteeUn } from "../api/entiteeUn";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const entiteeDeuxKeys = {
  all: ["entiteeDeux"] as const,
  lists: () => [...entiteeDeuxKeys.all, "list"] as const,
  list: (filters: string) => [...entiteeDeuxKeys.lists(), filters] as const,
  byParent: (parentId: number | string) =>
    [...entiteeDeuxKeys.all, "byParent", parentId] as const,
  details: () => [...entiteeDeuxKeys.all, "detail"] as const,
  detail: (id: number | string) => [...entiteeDeuxKeys.details(), id] as const,
  fonctions: (id: number | string) =>
    [...entiteeDeuxKeys.detail(id), "fonctions"] as const,
  titre: () => [...entiteeDeuxKeys.all, "titre"] as const,
  types: (id: number | string) =>
    [...entiteeDeuxKeys.detail(id), "types"] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer toutes les entités de niveau 2
// hooks/useEntiteeDeux.ts - Ajoutez ces logs
export const useEntiteeDeux = () => {
  return useQuery({
    queryKey: entiteeDeuxKeys.lists(),
    queryFn: async (): Promise<EntiteeDeux[]> => {
      try {
        const response = await getAllEntiteeDeux();

        let result: EntiteeDeux[] = [];
        if (Array.isArray(response)) {
          result = response;
        } else if (response && Array.isArray(response.entiteeDeux)) {
          result = response.entiteeDeux;
        } else {
          console.log("⚠️ [useEntiteeDeux] Format inattendu:", response);
        }

        return result;
      } catch (error) {
        console.error("❌ [useEntiteeDeux] Erreur API:", error);
        throw error;
      }
    },
  });
};

// Récupérer les entités par parent (EntiteeUn)
export const useEntiteeDeuxByEntiteeUn = (entiteeUnId: number | null) => {
  return useQuery({
    queryKey: entiteeDeuxKeys.byParent(entiteeUnId!),
    queryFn: async (): Promise<EntiteeDeux[]> => {
      if (!entiteeUnId) return [];
      const response = await getEntiteeDeuxByEntiteeUn(entiteeUnId);
      return response.entiteeDeux || [];
    },
    enabled: !!entiteeUnId,
  });
};

// Récupérer une entité spécifique
export const useEntiteeDeuxById = (id: number | string | null) => {
  return useQuery({
    queryKey: entiteeDeuxKeys.detail(id!),
    queryFn: async (): Promise<EntiteeDeux | null> => {
      const response = await getAllEntiteeDeux();
      const entitees = response.entiteeDeux || [];
      return (
        entitees.find((e: EntiteeDeux) => String(e.id) === String(id)) || null
      );
    },
    enabled: !!id,
  });
};

// Récupérer les fonctions d'une entité
export const useFonctionsByEntiteeDeux = (id: number | string | null) => {
  return useQuery({
    queryKey: entiteeDeuxKeys.fonctions(id!),
    queryFn: async (): Promise<Fonction[]> => {
      if (!id) return [];
      const data = await getFunctionsByEntiteeDeux(Number(id));
      return Array.isArray(data) ? data : [];
    },
    enabled: !!id,
  });
};

// Récupérer le titre de l'entité
export const useEntiteeDeuxTitre = () => {
  return useQuery({
    queryKey: entiteeDeuxKeys.titre(),
    queryFn: async (): Promise<string> => {
      const response = await getEntiteeDeuxTitre();
      return response.titre || "Entité 2";
    },
  });
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer une entité
export const useCreateEntiteeDeux = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEntitee: Partial<EntiteeDeux>) =>
      createEntiteeDeux(newEntitee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeDeuxKeys.lists() });
    },
  });
};

// Mettre à jour une entité
export const useUpdateEntiteeDeux = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EntiteeDeux> }) =>
      updateEntiteeDeuxById(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entiteeDeuxKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: entiteeDeuxKeys.detail(variables.id),
      });
    },
  });
};

// Supprimer une entité
export const useDeleteEntiteeDeux = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEntiteeDeuxById(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: entiteeDeuxKeys.lists() });
      queryClient.removeQueries({
        queryKey: entiteeDeuxKeys.detail(deletedId),
      });
    },
  });
};

// Mettre à jour le titre
export const useUpdateEntiteeDeuxTitre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (titre: string) => updateEntiteeDeuxTitre(titre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeDeuxKeys.titre() });
    },
  });
};

export const useEntiteeDeuxTypes = (entiteeDeuxId?: number) => {
  return useQuery({
    queryKey: entiteeDeuxKeys.types(entiteeDeuxId!),
    queryFn: () => getTypesOfEntiteeDeux(entiteeDeuxId!),
    enabled: !!entiteeDeuxId,
  });
};

// Hook pour ajouter des types de documents à une direction
export const useAddTypesToEntiteeDeux = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entiteeDeuxId,
      typeIds,
    }: {
      entiteeDeuxId: number;
      typeIds: number[];
    }) => addTypesToEntiteeDeux(entiteeDeuxId, typeIds),
    onSuccess: (_, { entiteeDeuxId }) => {
      queryClient.invalidateQueries({
        queryKey: entiteeDeuxKeys.list(String(entiteeDeuxId)),
      });
      queryClient.invalidateQueries({ queryKey: ["entiteeDeuxs"] });
    },
  });
};

// Hook pour retirer des types de documents d'une direction
export const useRemoveTypesFromEntiteeDeux = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entiteeDeuxId,
      typeIds,
    }: {
      entiteeDeuxId: number;
      typeIds: number[];
    }) => removeTypesFromEntiteeDeux(entiteeDeuxId, typeIds),
    onSuccess: (_, { entiteeDeuxId }) => {
      queryClient.invalidateQueries({
        queryKey: entiteeDeuxKeys.list(String(entiteeDeuxId)),
      });
      queryClient.invalidateQueries({ queryKey: ["entiteeDeuxs"] });
    },
  });
};
