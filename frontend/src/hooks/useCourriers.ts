// src/hooks/useCourriers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  getPiecesJointes,
  deletePieceJointe,
  downloadPieceJointe,
  deleteCourrier,
} from "../api/courrier";
import api from "../api/axios";
import { Courrier, CourrierCreatePayload } from "../interfaces/courrier";

// Hook principal pour récupérer tous les courriers (avec filtres)
export const useCourriers = (filters = {}) => {
  return useQuery({
    queryKey: ["courriers", filters],
    queryFn: () => getCourriers(filters),
    staleTime: 1000 * 60 * 5,
  });
};

// Hook pour les courriers attribués à l'utilisateur connecté
export const useMesAttribues = () => {
  return useQuery({
    queryKey: ["mesAttribues"],
    queryFn: getMesAttribues,
  });
};

// Hook pour un courrier par ID
export const useCourrierById = (id: number) => {
  return useQuery({
    queryKey: ["courrier", id],
    queryFn: () => getCourrierById(id),
    enabled: !!id,
  });
};

// ⭐ NOUVEAU: Hook pour récupérer les pièces jointes
export const usePiecesJointes = (courrierId: number) => {
  return useQuery({
    queryKey: ["piecesJointes", courrierId],
    queryFn: () => getPiecesJointes(courrierId),
    enabled: !!courrierId,
  });
};

// Création d'un courrier
export const useCreateCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CourrierCreatePayload) => createCourrier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courriers"] });
      queryClient.invalidateQueries({ queryKey: ["mesAttribues"] });
    },
  });
};

// Validation d'un courrier
export const useValiderCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => validerCourrier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courriers"] });
    },
  });
};

// Rejet d'un courrier
export const useRejeterCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: number; motif: string }) =>
      rejeterCourrier(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courriers"] });
    },
  });
};

// Attribution d'un courrier à un agent
export const useAttribuerCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      attribuerCourrier(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courriers"] });
      queryClient.invalidateQueries({ queryKey: ["mesAttribues"] });
    },
  });
};

// ⭐ NOUVEAU: Attribution d'un courrier à une entité (Division/Bureau)
export const useAttribuerCourrierAEntite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { entiteeId: number; entiteeType: string; motif?: string };
    }) => attribuerCourrierAEntite(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courriers"] });
      queryClient.invalidateQueries({ queryKey: ["mesAttribues"] });
    },
  });
};

// Traitement d'un courrier
export const useTraiterCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      traiterCourrier(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courriers"] });
      queryClient.invalidateQueries({ queryKey: ["mesAttribues"] });
    },
  });
};

// Ajout de pièces jointes
export const useAddPiecesJointes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) => {
      console.log("📤 useAddPiecesJointes - Appel API pour courrier:", id);
      console.log("📤 Nombre de fichiers:", files.length);
      return addPiecesJointes(id, files);
    },
    onSuccess: (data, variables) => {
      console.log("✅ useAddPiecesJointes - Succès:", data);
      queryClient.invalidateQueries({ queryKey: ["courrier", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["piecesJointes", variables.id],
      });
    },
    onError: (error) => {
      console.error("❌ useAddPiecesJointes - Erreur:", error);
    },
  });
};

// ⭐ NOUVEAU: Suppression d'une pièce jointe
export const useDeletePieceJointe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courrierId,
      fileId,
    }: {
      courrierId: number;
      fileId: number;
    }) => deletePieceJointe(courrierId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["piecesJointes", variables.courrierId],
      });
      queryClient.invalidateQueries({
        queryKey: ["courrier", variables.courrierId],
      });
    },
  });
};

// ⭐ NOUVEAU: Téléchargement d'une pièce jointe
export const useDownloadPieceJointe = () => {
  return useMutation({
    mutationFn: ({ fileId, fileName }: { fileId: number; fileName?: string }) =>
      downloadPieceJointe(fileId, fileName),
  });
};

// Suppression d'un courrier
export const useDeleteCourrier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCourrier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courriers"] });
      queryClient.invalidateQueries({ queryKey: ["mesAttribues"] });
    },
  });
};

// ⭐ NOUVEAU: Attribution multiple (vous aviez déjà commencé à l'écrire)
export const useAttribuerMultiple = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attributions }: { id: number; attributions: any[] }) =>
      api.post(`/courrier/${id}/attribuer-multiple`, { attributions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courriers"] });
      queryClient.invalidateQueries({ queryKey: ["mesAttribues"] });
    },
  });
};
