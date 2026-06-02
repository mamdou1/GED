// src/hooks/useTypeCompteMetafield.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTypeCompteMetaField,
  deleteTypeCompteMetaField,
  getTypeCompteMetaFields,
  updateTypeCompteMetaField,
} from "../api/typeCompteMetafield";
import {
  TypeCompteMetaFieldCreatePayload,
  TypeCompteMetaFieldUpdatePayload,
} from "../interfaces";
import { typeCompteKeys } from "./useTypeComptes";

export const typeCompteMetaFieldKeys = {
  all: ["type-compte-meta-fields"] as const,
  byType: (typeId?: number) =>
    [...typeCompteMetaFieldKeys.all, "type", typeId] as const,
};

export const useTypeCompteMetaFields = (typeId?: number) => {
  return useQuery({
    queryKey: typeCompteMetaFieldKeys.byType(typeId),
    queryFn: () => getTypeCompteMetaFields(typeId!),
    enabled: !!typeId,
  });
};

export const useCreateTypeCompteMetaField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      typeId,
      data,
    }: {
      typeId: number;
      data: TypeCompteMetaFieldCreatePayload;
    }) => createTypeCompteMetaField(typeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: typeCompteMetaFieldKeys.byType(variables.typeId),
      });
      queryClient.invalidateQueries({ queryKey: typeCompteKeys.all });
    },
  });
};

export const useUpdateTypeCompteMetaField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      typeId,
      data,
    }: {
      id: number;
      typeId: number;
      data: TypeCompteMetaFieldUpdatePayload;
    }) => updateTypeCompteMetaField(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: typeCompteMetaFieldKeys.byType(variables.typeId),
      });
      queryClient.invalidateQueries({ queryKey: typeCompteKeys.all });
    },
  });
};

export const useDeleteTypeCompteMetaField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; typeId: number }) =>
      deleteTypeCompteMetaField(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: typeCompteMetaFieldKeys.byType(variables.typeId),
      });
      queryClient.invalidateQueries({ queryKey: typeCompteKeys.all });
    },
  });
};
