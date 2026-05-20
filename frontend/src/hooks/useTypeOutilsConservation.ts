import { useQuery } from "@tanstack/react-query";
import { getAll, getByID } from "../api/typeOutilsConservation";
import type { TypeOutilsConservation } from "../interfaces";

// Clés React Query
export const typeOutilsConservationKeys = {
  all: ["type-outils-conservation"] as const,
  lists: () => [...typeOutilsConservationKeys.all, "list"] as const,
  list: (params?: any) =>
    [...typeOutilsConservationKeys.lists(), params] as const,
  details: () => [...typeOutilsConservationKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...typeOutilsConservationKeys.details(), id] as const,
};

/**
 * Récupérer tous les types d'outils de conservation
 */
// export const useTypeOutilsConservation = (params?: any) => {
//   return useQuery({
//     queryKey: typeOutilsConservationKeys.list(params),
//     queryFn: () => getAll(params),
//   });
// };

export const useTypeOutilsConservation = () => {
  return useQuery({
    queryKey: typeOutilsConservationKeys.lists(),
    queryFn: async (): Promise<TypeOutilsConservation[]> => {
      const response = await getAll();
      // Gérer les différents formats de réponse possibles
      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray(response.typeOutilsConservation)) {
        return response.typeOutilsConservation;
      }
      return [];
    },
  });
};

/**
 * Récupérer un type par ID
 */
export const useTypeOutilsConservationById = (id?: string, payload?: any) => {
  return useQuery({
    queryKey: typeOutilsConservationKeys.detail(id || ""),
    queryFn: () => getByID(id as string, payload),
    enabled: !!id,
  });
};

// Ré-exporter les mutations depuis le fichier séparé
export {
  useCreateTypeOutilsConservation,
  useUpdateTypeOutilsConservation,
  useDeleteTypeOutilsConservation,
} from "./useTypeOutilsConservationMutations";
