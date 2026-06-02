// src/hooks/useClients.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getTypesDocumentByClient,
} from "../api/client";
import { ClientCreatePayload, ClientUpdatePayload } from "../interfaces/client";

// Clés React Query
export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (params?: any) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: number) => [...clientKeys.details(), id] as const,
};

/**
 * Récupérer tous les clients (avec pagination et filtres)
 */
export const useClients = (params?: {
  search?: string;
  conserne?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => getClients(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Récupérer un client par ID
 */
export const useClientById = (id?: number) => {
  return useQuery({
    queryKey: clientKeys.detail(id!),
    queryFn: () => getClientById(id!),
    enabled: !!id,
  });
};

/**
 * Créer un client
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClientCreatePayload) => createClient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

/**
 * Mettre à jour un client
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientUpdatePayload }) =>
      updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Supprimer un client
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

export const useTypesDocumentByClient = (clientId?: number) => {
  return useQuery({
    queryKey: ["types-document", "client", clientId],
    queryFn: () => {
      if (!clientId) return [];
      return getTypesDocumentByClient(clientId);
    },
    enabled: !!clientId,
  });
};
