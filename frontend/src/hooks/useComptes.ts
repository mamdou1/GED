// src/hooks/useComptes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComptes,
  getCompteById,
  getComptesByClient,
  getTypeDocumentsByCompte,
  createCompte,
  updateCompte,
  deleteCompte,
} from "../api/compte";
import {
  Compte,
  CompteCreatePayload,
  CompteUpdatePayload,
} from "../interfaces/index";

// Clés React Query
export const compteKeys = {
  all: ["comptes"] as const,
  lists: () => [...compteKeys.all, "list"] as const,
  list: (params?: any) => [...compteKeys.lists(), params] as const,
  details: () => [...compteKeys.all, "detail"] as const,
  detail: (id: number) => [...compteKeys.details(), id] as const,
  byClient: (clientId: number) =>
    [...compteKeys.all, "client", clientId] as const,
  typeDocuments: (compteId: number) =>
    [...compteKeys.all, "type-documents", compteId] as const,
};

/**
 * Récupérer tous les comptes
 */
export const useComptes = (params?: {
  search?: string;
  type_compte_id?: number;
  client_id?: number;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: compteKeys.list(params),
    queryFn: () => getComptes(params),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Récupérer un compte par ID
 */
export const useCompteById = (id?: number) => {
  return useQuery({
    queryKey: compteKeys.detail(id!),
    queryFn: () => getCompteById(id!),
    enabled: !!id,
  });
};

/**
 * Récupérer les documents types associés à un compte
 */
export const useTypeDocumentsByCompte = (compteId?: number) => {
  return useQuery({
    queryKey: compteKeys.typeDocuments(compteId!),
    queryFn: () => getTypeDocumentsByCompte(compteId!),
    enabled: !!compteId,
    select: (response) => response.data,
  });
};

/**
 * Récupérer les comptes d'un client
 */
export const useComptesByClient = (clientId?: number) => {
  return useQuery({
    queryKey: compteKeys.byClient(clientId!),
    queryFn: () => getComptesByClient(clientId!),
    enabled: !!clientId,
  });
};

/**
 * Créer un compte
 */
export const useCreateCompte = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompteCreatePayload) => createCompte(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compteKeys.all });
      queryClient.invalidateQueries({
        queryKey: compteKeys.byClient(variables.client_id),
      });
    },
  });
};

/**
 * Mettre à jour un compte
 */
export const useUpdateCompte = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompteUpdatePayload }) =>
      updateCompte(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compteKeys.all });
      queryClient.invalidateQueries({
        queryKey: compteKeys.detail(variables.id),
      });
      if (variables.data.client_id) {
        queryClient.invalidateQueries({
          queryKey: compteKeys.byClient(variables.data.client_id),
        });
      }
    },
  });
};

/**
 * Supprimer un compte
 */
export const useDeleteCompte = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCompte(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compteKeys.all });
    },
  });
};
