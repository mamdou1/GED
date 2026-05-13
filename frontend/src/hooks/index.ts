// ==================== EXPORTS POUR LES DIRECTIONS ====================
export {
  useEntiteeUn,
  useEntiteeUnById,
  useCreateEntiteeUn,
  useUpdateEntiteeUn,
  useDeleteEntiteeUn,
  useEntiteeUnTypes,
  useAddTypesToEntiteeUn,
  useRemoveTypesFromEntiteeUn,
  entiteeUnKeys,
} from "./useEntiteeUn";

// ==================== EXPORTS POUR LES SERVICES ====================
export {
  useEntiteeDeux,
  useEntiteeDeuxById,
  useCreateEntiteeDeux,
  useUpdateEntiteeDeux,
  useDeleteEntiteeDeux,
  useEntiteeDeuxByEntiteeUn,
  useEntiteeDeuxTypes,
  useAddTypesToEntiteeDeux,
  useRemoveTypesFromEntiteeDeux,
  entiteeDeuxKeys,
} from "./useEntiteeDeux";

// ==================== EXPORTS POUR LES SOUS-DIRECTIONS ====================
export {
  useEntiteeTrois,
  useEntiteeTroisById,
  useCreateEntiteeTrois,
  useUpdateEntiteeTrois,
  useDeleteEntiteeTrois,
  useEntiteeTroisByEntiteeDeux,
  useEntiteeTroisTypes,
  useAddTypesToEntiteeTrois,
  useRemoveTypesFromEntiteeTrois,
  entiteeTroisKeys,
} from "./useEntiteeTrois";
