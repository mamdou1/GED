// hooks/useTypeDocuments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTypeDocuments,
  createTypeDocument,
  updateTypeDocument,
  deleteTypeDocument,
  addPiecesToTypeDocument,
  removePiecesFromTypeDocument,
  addPieceToEntityTypeDocument,
  removePieceFromEntityTypeDocument,
  getEffectivePiecesForEntity,
  getTypesWithConserne,
  assignTypeCompteToTypeDocument,
} from "../api/typeDocument";
import { createMetaField, updateMetaField } from "../api/metaField";
import { getPieces } from "../api/pieces";
import { getAllEntiteeUn } from "../api/entiteeUn";
import { getAllEntiteeDeux } from "../api/entiteeDeux";
import { getAllEntiteeTrois } from "../api/entiteeTrois";
import type {
  TypeDocument,
  Pieces,
  AddPiecesToTypeDocumentPayload,
} from "../interfaces";

// =============================================
// 1. CLÉS DE CACHE
// =============================================
export const typeDocumentKeys = {
  all: ["typeDocuments"] as const,
  lists: () => [...typeDocumentKeys.all, "list"] as const,
  list: (filters: string) => [...typeDocumentKeys.lists(), filters] as const,
  details: () => [...typeDocumentKeys.all, "detail"] as const,
  detail: (id: number) => [...typeDocumentKeys.details(), id] as const,
  withConserne: () => [...typeDocumentKeys.all, "with-conserne"] as const,
};

export const piecesKeys = {
  all: ["pieces"] as const,
  lists: () => [...piecesKeys.all, "list"] as const,
};

export const entiteeKeys = {
  un: ["entiteeUn"] as const,
  deux: ["entiteeDeux"] as const,
  trois: ["entiteeTrois"] as const,
};

export const effectivePiecesKeys = {
  all: ["effectivePieces"] as const,
  detail: (typeDocumentId: string, entityType: string, entityId: number) =>
    [...effectivePiecesKeys.all, typeDocumentId, entityType, entityId] as const,
};

// =============================================
// 2. HOOKS DE LECTURE (QUERIES)
// =============================================

// Récupérer tous les types de documents
export const useTypeDocuments = () => {
  return useQuery({
    queryKey: typeDocumentKeys.lists(),
    queryFn: async () => {
      // ✅ CORRECTION : getTypeDocuments retourne directement le tableau
      const res = await getTypeDocuments();
      // res est maintenant directement un tableau de TypeDocument
      return Array.isArray(res) ? res : [];
    },
  });
};

// Récupérer toutes les pièces
export const usePieces = () => {
  return useQuery({
    queryKey: piecesKeys.lists(),
    queryFn: async () => {
      const res = await getPieces();
      return Array.isArray(res) ? res : [];
    },
  });
};

// Récupérer toutes les entités
export const useEntitees = () => {
  const queryUn = useQuery({
    queryKey: entiteeKeys.un,
    queryFn: async () => {
      const res = await getAllEntiteeUn();
      return Array.isArray(res) ? res : res.entiteeUn || [];
    },
  });

  const queryDeux = useQuery({
    queryKey: entiteeKeys.deux,
    queryFn: async () => {
      const res = await getAllEntiteeDeux();
      return Array.isArray(res) ? res : res.entiteeDeux || [];
    },
  });

  const queryTrois = useQuery({
    queryKey: entiteeKeys.trois,
    queryFn: async () => {
      const res = await getAllEntiteeTrois();
      return Array.isArray(res) ? res : res.entiteeTrois || [];
    },
  });

  return {
    entiteeUn: queryUn.data || [],
    entiteeDeux: queryDeux.data || [],
    entiteeTrois: queryTrois.data || [],
    isLoading: queryUn.isLoading || queryDeux.isLoading || queryTrois.isLoading,
    error: queryUn.error || queryDeux.error || queryTrois.error,
    refetch: async () => {
      await Promise.all([
        queryUn.refetch(),
        queryDeux.refetch(),
        queryTrois.refetch(),
      ]);
    },
  };
};

// Hook combiné pour charger toutes les données initiales
export const useInitialData = () => {
  const typesQuery = useTypeDocuments();
  const piecesQuery = usePieces();
  const entitees = useEntitees();

  const isLoading =
    typesQuery.isLoading || piecesQuery.isLoading || entitees.isLoading;
  const error = typesQuery.error || piecesQuery.error || entitees.error;

  // Log pour debug
  console.log("🔍 useInitialData (types) - typesQuery.data:", typesQuery.data);
  console.log(
    "🔍 useInitialData (types) - types length:",
    typesQuery.data?.length,
  );

  // Créer les options d'entités pour le dropdown
  const optionsEntites = [
    { label: "Tous les profils", value: null },
    ...(entitees.entiteeUn || []).map((x: any) => ({
      label: `🏢 ${x.libelle}`,
      value: String(x.id),
      titre: x.titre,
    })),
    ...(entitees.entiteeDeux || []).map((x: any) => ({
      label: `📂 ${x.libelle}`,
      value: `E2-${x.id}`,
      titre: x.titre,
    })),
    ...(entitees.entiteeTrois || []).map((x: any) => ({
      label: `📄 ${x.libelle}`,
      value: `E3-${x.id}`,
      titre: x.titre,
    })),
  ];

  return {
    types: typesQuery.data || [],
    pieces: piecesQuery.data || [],
    entiteeUn: entitees.entiteeUn,
    entiteeDeux: entitees.entiteeDeux,
    entiteeTrois: entitees.entiteeTrois,
    optionsEntites,
    isLoading,
    error,
    refetch: async () => {
      await typesQuery.refetch();
      await piecesQuery.refetch();
      await entitees.refetch();
    },
  };
};

// =============================================
// 3. HOOKS D'ÉCRITURE (MUTATIONS)
// =============================================

// Créer un type de document
export const useCreateTypeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newType: any) => createTypeDocument(newType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.lists() });
    },
  });
};

// Mettre à jour un type de document
export const useUpdateTypeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateTypeDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: typeDocumentKeys.detail(parseInt(variables.id)),
      });
    },
  });
};

// Supprimer un type de document
export const useDeleteTypeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTypeDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.lists() });
    },
  });
};

// Ajouter des pièces à un type de document
export const useAddPiecesToTypeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      typeId,
      payload,
    }: {
      typeId: string;
      payload: AddPiecesToTypeDocumentPayload;
    }) => addPiecesToTypeDocument(typeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.lists() });
    },
  });
};

// Créer un champ de métadonnée
export const useCreateMetaField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ typeId, field }: { typeId: number; field: any }) =>
      createMetaField(String(typeId), field),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.lists() });
    },
  });
};

// Mettre à jour un champ de métadonnée
export const useUpdateMetaField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, field }: { id: number; field: any }) =>
      updateMetaField(String(id), field),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.lists() });
    },
  });
};

// Mutation pour affectation multiple
export const useMultipleAffectation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      typeIds,
      structureData,
    }: {
      typeIds: string[];
      structureData: any;
    }) => {
      await Promise.all(
        typeIds.map((id) => updateTypeDocument(id, structureData)),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.lists() });
    },
  });
};

// Récupérer les pièces effectives pour une entité
export const useEffectivePiecesForEntity = (
  typeDocumentId: string,
  entityType: string,
  entityId: number,
) => {
  return useQuery({
    queryKey: effectivePiecesKeys.detail(typeDocumentId, entityType, entityId),
    queryFn: () =>
      getEffectivePiecesForEntity(typeDocumentId, entityType, entityId),
    enabled: !!typeDocumentId && !!entityType && !!entityId,
  });
};

// Ajouter une pièce spécifique à une entité
export const useAddPieceToEntityTypeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      typeDocumentId,
      payload,
    }: {
      typeDocumentId: string;
      payload: {
        entity_type: string;
        entity_id: number;
        piece_id: number;
      };
    }) => addPieceToEntityTypeDocument(typeDocumentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: typeDocumentKeys.detail(parseInt(variables.typeDocumentId)),
      });
      queryClient.invalidateQueries({
        queryKey: effectivePiecesKeys.all,
      });
    },
    onError: (error: any) => {
      console.error("❌ Erreur ajout pièce entité:", error);
    },
  });
};

// Retirer une pièce spécifique à une entité
export const useRemovePieceFromEntityTypeDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      typeDocumentId,
      payload,
    }: {
      typeDocumentId: string;
      payload: {
        entity_type: string;
        entity_id: number;
        piece_id: number;
      };
    }) => removePieceFromEntityTypeDocument(typeDocumentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: typeDocumentKeys.detail(parseInt(variables.typeDocumentId)),
      });
      queryClient.invalidateQueries({
        queryKey: effectivePiecesKeys.all,
      });
    },
    onError: (error: any) => {
      console.error("❌ Erreur retrait pièce entité:", error);
    },
  });
};

/**
 * ✅ Récupérer les types de documents avec conserne non null
 */
export const useTypesWithConserne = (params?: {
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: [...typeDocumentKeys.withConserne(), params],
    queryFn: () => getTypesWithConserne(params),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * ✅ Affecter un type de compte à un type de document
 */
export const useAssignTypeCompteToTypeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ typeDocumentId, typeCompteId }: { typeDocumentId: number; typeCompteId: number | null }) =>
      assignTypeCompteToTypeDocument(typeDocumentId, typeCompteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.all });
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.detail(variables.typeDocumentId) });
      queryClient.invalidateQueries({ queryKey: typeDocumentKeys.withConserne() });
    },
  });
};