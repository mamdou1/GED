// hooks/useMetaFieldOverrides.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllFieldsForEntity,
  setMetaFieldOverride,
  removeMetaFieldOverride,
  addCustomField,
  deleteCustomField,
  toggleCustomFieldHide,
  updateCustomField,
} from "../api/metaField";
import { toast } from "react-hot-toast";

// ✅ Utiliser getAllFieldsForEntity (avec /all) pour récupérer base + personnalisés
export const useEntityMetaFields = (
  typeDocumentId: number,
  entityType: string,
  entityId: number
) => {
  return useQuery({
    queryKey: ["entityMetaFields", typeDocumentId, entityType, entityId],
    queryFn: () => getAllFieldsForEntity(typeDocumentId, entityType, entityId), // ← ICI
    enabled: !!typeDocumentId && !!entityType && !!entityId,
  });
};

export const useSetFieldOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ typeId, metaFieldId, entityType, entityId, overrideData }: any) =>
      setMetaFieldOverride(typeId, metaFieldId, entityType, entityId, overrideData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entityMetaFields", variables.typeId, variables.entityType, variables.entityId],
      });
      toast.success("Personnalisation enregistrée");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur");
    },
  });
};

export const useRemoveFieldOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ typeId, metaFieldId, entityType, entityId }: any) =>
      removeMetaFieldOverride(typeId, metaFieldId, entityType, entityId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entityMetaFields", variables.typeId, variables.entityType, variables.entityId],
      });
      toast.success("Personnalisation supprimée");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur");
    },
  });
};

export const useAddCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ typeId, entityType, entityId, fieldData }: any) =>
      addCustomField(typeId, entityType, entityId, fieldData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entityMetaFields", variables.typeId, variables.entityType, variables.entityId],
      });
      toast.success("Champ personnalisé ajouté");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de l'ajout");
    },
  });
};

export const useDeleteCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ typeId, entityType, entityId, fieldId }: any) =>
      deleteCustomField(typeId, entityType, entityId, fieldId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entityMetaFields", variables.typeId, variables.entityType, variables.entityId],
      });
      toast.success("Champ supprimé");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la suppression");
    },
  });
};

export const useToggleCustomFieldHide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ typeId, entityType, entityId, fieldId, hidden }: any) =>
      toggleCustomFieldHide(typeId, entityType, entityId, fieldId, hidden),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entityMetaFields", variables.typeId, variables.entityType, variables.entityId],
      });
      toast.success(variables.hidden ? "Champ masqué" : "Champ affiché");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur");
    },
  });
};

export const useUpdateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ typeId, entityType, entityId, fieldId, fieldData }: any) =>
      updateCustomField(typeId, entityType, entityId, fieldId, fieldData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entityMetaFields", variables.typeId, variables.entityType, variables.entityId],
      });
      toast.success("Champ modifié");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la modification");
    },
  });
};