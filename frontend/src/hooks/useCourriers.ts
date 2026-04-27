// src/hooks/useCourriers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCourriers, 
  getCourrierById, 
  getMesAttribues, 
  createCourrier, 
  validerCourrier, 
  rejeterCourrier, 
  attribuerCourrier,
  attribuerCourrierAEntite,
  traiterCourrier,
  addPiecesJointes,
  deleteCourrier
} from '../api/courrier';
import api from '../api/axios';
import { Courrier, CourrierCreatePayload } from '../interfaces/courrier';

// Hook principal pour récupérer tous les courriers (avec filtres)
export const useCourriers = (filters = {}) => {
  return useQuery({
    queryKey: ['courriers', filters],
    queryFn: () => getCourriers(filters),
    staleTime: 1000 * 60 * 5,
  });
};

// Hook pour les courriers attribués à l'utilisateur connecté
export const useMesAttribues = () => {
  return useQuery({
    queryKey: ['mesAttribues'],
    queryFn: getMesAttribues,
  });
};

// Hook pour un courrier par ID
export const useCourrierById = (id: number) => {
  return useQuery({
    queryKey: ['courrier', id],
    queryFn: () => getCourrierById(id),
    enabled: !!id,
  });
};

// Création d'un courrier
export const useCreateCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CourrierCreatePayload) => createCourrier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courriers'] });
      queryClient.invalidateQueries({ queryKey: ['mesAttribues'] });
    },
  });
};

// Validation d'un courrier
export const useValiderCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => validerCourrier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courriers'] });
    },
  });
};

// Rejet d'un courrier
export const useRejeterCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: number; motif: string }) => rejeterCourrier(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courriers'] });
    },
  });
};

// Attribution d'un courrier à un agent
export const useAttribuerCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => attribuerCourrier(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courriers'] });
      queryClient.invalidateQueries({ queryKey: ['mesAttribues'] });
    },
  });
};

// ⭐ NOUVEAU: Attribution d'un courrier à une entité (Division/Bureau)
export const useAttribuerCourrierAEntite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { entiteeId: number; entiteeType: string; motif?: string } }) => 
      attribuerCourrierAEntite(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courriers'] });
      queryClient.invalidateQueries({ queryKey: ['mesAttribues'] });
    },
  });
};

// Traitement d'un courrier
export const useTraiterCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => traiterCourrier(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courriers'] });
      queryClient.invalidateQueries({ queryKey: ['mesAttribues'] });
    },
  });
};

// Ajout de pièces jointes
export const useAddPiecesJointes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) => addPiecesJointes(id, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courrier', variables.id] });
    },
  });
};

// Suppression d'un courrier
export const useDeleteCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCourrier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courriers'] });
      queryClient.invalidateQueries({ queryKey: ['mesAttribues'] });
    },
  });
};


// src/hooks/useCourriers.ts
// Ajoute ce hook

// Attributions multiples
export const useAttribuerMultiple = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attributions }: { id: number; attributions: any[] }) =>
      api.post(`/courrier/${id}/attribuer-multiple`, { attributions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courriers'] });
      queryClient.invalidateQueries({ queryKey: ['mesAttribues'] });
    },
  });
};