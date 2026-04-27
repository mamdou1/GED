// src/hooks/useDestinatairesExternes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDestinatairesExternes, createDestinataireExterne, updateDestinataireExterne, deleteDestinataireExterne } from '../api/destinataireExterne';
import { DestinataireExterne } from '../interfaces/destinataireExterne';

export const useDestinatairesExternes = () => {
  return useQuery({
    queryKey: ['destinatairesExternes'],
    queryFn: getDestinatairesExternes,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateDestinataireExterne = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DestinataireExterne>) => createDestinataireExterne(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinatairesExternes'] });
    },
  });
};

export const useUpdateDestinataireExterne = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DestinataireExterne> }) => updateDestinataireExterne(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinatairesExternes'] });
    },
  });
};

export const useDeleteDestinataireExterne = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDestinataireExterne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinatairesExternes'] });
    },
  });
};