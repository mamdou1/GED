import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createType,
  updateType,
  deleteType,
} from "../api/typeOutilsConservation";
import type { TypeOutilsConservation } from "../interfaces";
import { typeOutilsConservationKeys } from "./useTypeOutilsConservation";

export const useCreateTypeOutilsConservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<TypeOutilsConservation>) =>
      createType(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: typeOutilsConservationKeys.all,
      });
    },
  });
};

export const useUpdateTypeOutilsConservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<TypeOutilsConservation>;
    }) => updateType(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: typeOutilsConservationKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: typeOutilsConservationKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteTypeOutilsConservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteType(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: typeOutilsConservationKeys.all,
      });
    },
  });
};
