import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateAddressRequest, ListAddressesQuery, UpdateAddressRequest } from '@crm/types';
import { addressesApi } from './api';

const addressKeys = {
  list: (query: ListAddressesQuery) => ['addresses', 'list', query] as const,
};

export function useAddresses(query: ListAddressesQuery) {
  return useQuery({
    queryKey: addressKeys.list(query),
    queryFn: () => addressesApi.list(query),
  });
}

export function useCreateAddress(query: ListAddressesQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressRequest) => addressesApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list(query) });
    },
  });
}

export function useUpdateAddress(query: ListAddressesQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAddressRequest }) => addressesApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list(query) });
    },
  });
}

export function useDeleteAddress(query: ListAddressesQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list(query) });
    },
  });
}
