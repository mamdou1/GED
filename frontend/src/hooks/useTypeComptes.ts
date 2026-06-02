// src/hooks/useTypeComptes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTypeComptes,
  getTypeCompteById,
  createTypeCompte,
  updateTypeCompte,
  deleteTypeCompte,
} from "../api/typeCompte";
import {
  TypeCompte,
  TypeCompteCreatePayload,
  TypeCompteUpdatePayload,
} from "../interfaces/index";

// Clés React Query
export const typeCompteKeys = {
  all: ["type-comptes"] as const,
  lists: () => [...typeCompteKeys.all, "list"] as const,
  list: (params?: any) => [...typeCompteKeys.lists(), params] as const,
  details: () => [...typeCompteKeys.all, "detail"] as const,
  detail: (id: number) => [...typeCompteKeys.details(), id] as const,
};

/**
 * Récupérer tous les types de compte
 */
export const useTypeComptes = (params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: typeCompteKeys.list(params),
    queryFn: () => getTypeComptes(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Récupérer un type de compte par ID
 */
export const useTypeCompteById = (id?: number) => {
  return useQuery({
    queryKey: typeCompteKeys.detail(id!),
    queryFn: () => getTypeCompteById(id!),
    enabled: !!id,
  });
};

/**
 * Créer un type de compte
 */
export const useCreateTypeCompte = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TypeCompteCreatePayload) => createTypeCompte(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typeCompteKeys.all });
    },
  });
};

/**
 * Mettre à jour un type de compte
 */
export const useUpdateTypeCompte = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TypeCompteUpdatePayload }) =>
      updateTypeCompte(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: typeCompteKeys.all });
      queryClient.invalidateQueries({
        queryKey: typeCompteKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Supprimer un type de compte
 */
export const useDeleteTypeCompte = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTypeCompte(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typeCompteKeys.all });
    },
  });
};
