// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getOnLigneUsers,
  desactiverUserCompte,
  activerUserCompte,
} from "../api/users";
import { getDroits } from "../api/droit";
import { grantAccess } from "../api/agentEntiteeAccess";
import type { User, Droit } from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number | string) => [...userKeys.details(), id] as const,
};

export const droitKeys = {
  all: ["droits"] as const,
  lists: () => [...droitKeys.all, "list"] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer tous les utilisateurs
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const data = await getUsers();
      return Array.isArray(data) ? data : [];
    },
  });
};

// Récupérer tous les droits
export const useDroits = () => {
  return useQuery({
    queryKey: droitKeys.lists(),
    queryFn: async () => {
      const data = await getDroits();
      return Array.isArray(data) ? data : [];
    },
  });
};

// Hook combiné pour charger toutes les données initiales
export const useInitialData = () => {
  const usersQuery = useUsers();
  const droitsQuery = useDroits();
  const onLigneUsersQuery = useQuery({
    queryKey: ["users", "online"],
    queryFn: async () => {
      const data = await getOnLigneUsers();
      return Array.isArray(data) ? data : [];
    },
  });

  const isLoading = usersQuery.isLoading || droitsQuery.isLoading;
  const error = usersQuery.error || droitsQuery.error;

  return {
    users: usersQuery.data || [],
    droits: droitsQuery.data || [],
    onLigneUsers: onLigneUsersQuery.data || [],
    isLoading,
    error,
    refetch: async () => {
      await usersQuery.refetch();
      await droitsQuery.refetch();
    },
  };
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer un utilisateur
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      photoFile,
    }: {
      payload: Partial<User>;
      photoFile?: File;
    }) => createUser(payload, photoFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Mettre à jour un utilisateur
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      photoFile,
    }: {
      id: string;
      payload: Partial<User>;
      photoFile?: File;
    }) => updateUser(payload, id, photoFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
  });
};

// Supprimer un utilisateur
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({
        queryKey: userKeys.detail(deletedId),
      });
    },
  });
};

// Désactiver le compte d'un utilisateur
export const useDesactiverUserCompte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => desactiverUserCompte(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({
        queryKey: userKeys.detail(deletedId),
      });
    },
  });
};

export const useActiverUserCompte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activerUserCompte(id),
    onSuccess: (_, updatedId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({
        queryKey: userKeys.detail(updatedId),
      });
    },
  });
};

// Accorder des accès à un utilisateur
export const useGrantAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any[]) => grantAccess(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
