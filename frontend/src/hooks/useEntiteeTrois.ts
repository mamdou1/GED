// hooks/useEntiteeTrois.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllEntiteeTrois,
  getEntiteeTroisByEntiteeDeux,
  createEntiteeTrois,
  updateEntiteeTroisById,
  deleteEntiteeTroisById,
  getFunctionsByEntiteeTrois,
  getEntiteeTroisTitre,
  updateEntiteeTroisTitre,
  getTypesOfEntiteeTrois,
  addTypesToEntiteeTrois,
  removeTypesFromEntiteeTrois,
} from "../api/entiteeTrois";
import type { EntiteeTrois, Fonction } from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const entiteeTroisKeys = {
  all: ["entiteeTrois"] as const,
  lists: () => [...entiteeTroisKeys.all, "list"] as const,
  list: (filters: string) => [...entiteeTroisKeys.lists(), filters] as const,
  byParent: (parentId: number | string) =>
    [...entiteeTroisKeys.all, "byParent", parentId] as const,
  details: () => [...entiteeTroisKeys.all, "detail"] as const,
  detail: (id: number | string) => [...entiteeTroisKeys.details(), id] as const,
  fonctions: (id: number | string) =>
    [...entiteeTroisKeys.detail(id), "fonctions"] as const,
  titre: () => [...entiteeTroisKeys.all, "titre"] as const,
  types: (id: number | string) =>
    [...entiteeTroisKeys.detail(id), "types"] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer toutes les entités de niveau 3
// export const useEntiteeTrois = () => {
//   return useQuery({
//     queryKey: entiteeTroisKeys.lists(),
//     queryFn: async (): Promise<EntiteeTrois[]> => {
//       const response = await getAllEntiteeTrois();
//       return response.entiteeTrois || [];
//     },
//   });
// };

export const useEntiteeTrois = () => {
  return useQuery({
    queryKey: entiteeTroisKeys.lists(),
    queryFn: async (): Promise<EntiteeTrois[]> => {
      try {
        const response = await getAllEntiteeTrois();

        let result: EntiteeTrois[] = [];
        if (Array.isArray(response)) {
          result = response;
        } else if (response && Array.isArray(response.entiteeTrois)) {
          result = response.entiteeTrois;
        } else {
          console.log("⚠️ [useEntiteeTrois] Format inattendu:", response);
        }

        return result;
      } catch (error) {
        console.error("❌ [useEntiteeTrois] Erreur API:", error);
        throw error;
      }
    },
  });
};

// Récupérer les entités par parent (EntiteeDeux)
export const useEntiteeTroisByEntiteeDeux = (entiteeDeuxId: number | null) => {
  return useQuery({
    queryKey: entiteeTroisKeys.byParent(entiteeDeuxId!),
    queryFn: async (): Promise<EntiteeTrois[]> => {
      if (!entiteeDeuxId) return [];
      const data = await getEntiteeTroisByEntiteeDeux(entiteeDeuxId);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!entiteeDeuxId,
  });
};

// Récupérer une entité spécifique
export const useEntiteeTroisById = (id: number | string | null) => {
  return useQuery({
    queryKey: entiteeTroisKeys.detail(id!),
    queryFn: async (): Promise<EntiteeTrois | null> => {
      const response = await getAllEntiteeTrois();
      const entitees = response.entiteeTrois || [];
      return (
        entitees.find((e: EntiteeTrois) => String(e.id) === String(id)) || null
      );
    },
    enabled: !!id,
  });
};

// Récupérer les fonctions d'une entité
export const useFonctionsByEntiteeTrois = (id: number | string | null) => {
  return useQuery({
    queryKey: entiteeTroisKeys.fonctions(id!),
    queryFn: async (): Promise<Fonction[]> => {
      if (!id) return [];
      const data = await getFunctionsByEntiteeTrois(Number(id));
      return Array.isArray(data) ? data : [];
    },
    enabled: !!id,
  });
};

// Récupérer le titre de l'entité
export const useEntiteeTroisTitre = () => {
  return useQuery({
    queryKey: entiteeTroisKeys.titre(),
    queryFn: async (): Promise<string> => {
      const response = await getEntiteeTroisTitre();
      return response.titre || "Entité 3";
    },
  });
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer une entité
export const useCreateEntiteeTrois = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEntitee: Partial<EntiteeTrois>) =>
      createEntiteeTrois(newEntitee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeTroisKeys.lists() });
    },
  });
};

// Mettre à jour une entité
export const useUpdateEntiteeTrois = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EntiteeTrois> }) =>
      updateEntiteeTroisById(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: entiteeTroisKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: entiteeTroisKeys.detail(variables.id),
      });
    },
  });
};

// Supprimer une entité
export const useDeleteEntiteeTrois = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEntiteeTroisById(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: entiteeTroisKeys.lists() });
      queryClient.removeQueries({
        queryKey: entiteeTroisKeys.detail(deletedId),
      });
    },
  });
};

// Mettre à jour le titre
export const useUpdateEntiteeTroisTitre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (titre: string) => updateEntiteeTroisTitre(titre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entiteeTroisKeys.titre() });
    },
  });
};

export const useEntiteeTroisTypes = (entiteeTroisId?: number) => {
  return useQuery({
    queryKey: entiteeTroisKeys.types(entiteeTroisId!),
    queryFn: () => getTypesOfEntiteeTrois(entiteeTroisId!),
    enabled: !!entiteeTroisId,
  });
};

// Hook pour ajouter des types de documents à une direction
export const useAddTypesToEntiteeTrois = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entiteeTroisId,
      typeIds,
    }: {
      entiteeTroisId: number;
      typeIds: number[];
    }) => addTypesToEntiteeTrois(entiteeTroisId, typeIds),
    onSuccess: (_, { entiteeTroisId }) => {
      queryClient.invalidateQueries({
        queryKey: entiteeTroisKeys.list(String(entiteeTroisId)),
      });
      queryClient.invalidateQueries({ queryKey: ["entiteeTrois"] });
    },
  });
};

// Hook pour retirer des types de documents d'une direction
export const useRemoveTypesFromEntiteeTrois = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entiteeTroisId,
      typeIds,
    }: {
      entiteeTroisId: number;
      typeIds: number[];
    }) => removeTypesFromEntiteeTrois(entiteeTroisId, typeIds),
    onSuccess: (_, { entiteeTroisId }) => {
      queryClient.invalidateQueries({
        queryKey: entiteeTroisKeys.list(String(entiteeTroisId)),
      });
      queryClient.invalidateQueries({ queryKey: ["entiteeTrois  "] });
    },
  });
};
