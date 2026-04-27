// src/hooks/useExpediteurs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpediteurs, createExpediteur, updateExpediteur, deleteExpediteur } from '../api/expediteur';

// Type pour la création d'un expéditeur
export type CreateExpediteurPayload = {
  type: "PERSONNE" | "STRUCTURE";
  nom: string | null;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
};

export const useExpediteurs = () => {
  return useQuery({
    queryKey: ['expediteurs'],
    queryFn: getExpediteurs,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateExpediteur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpediteurPayload) => createExpediteur(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expediteurs'] });
    },
  });
};

export const useUpdateExpediteur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateExpediteurPayload> }) => 
      updateExpediteur(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expediteurs'] });
    },
  });
};

export const useDeleteExpediteur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExpediteur(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expediteurs'] });
    },
  });
};