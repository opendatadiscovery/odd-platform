import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest,
  OwnerAssociationRequestApiCreateUserOwnerMappingRequest,
  OwnerAssociationRequestApiDeleteActiveUserOwnerMappingRequest,
  OwnerAssociationRequestApiGetOwnerAssociationRequestActivityListRequest,
  OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest,
  OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest,
} from 'generated-sources/apis';
import { ownerAssociationRequestApi } from 'lib/api';
import { showSuccessToast } from 'lib/errorHandling';
import { addNextPage } from './utils';

export function useGetOwnerAssociationRequestList({
  query,
  size,
  status,
}: Omit<OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['ownerAssociationRequestList', query, size, status],
    queryFn: async ({ pageParam }) => {
      const response = await ownerAssociationRequestApi.getOwnerAssociationRequestList({
        query,
        size,
        status,
        page: pageParam,
      });

      return addNextPage(response, pageParam, size);
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.pageInfo.nextPage,
  });
}

export function useGetOwnerAssociationActivityList({
  query,
  size,
  status,
}: Omit<
  OwnerAssociationRequestApiGetOwnerAssociationRequestActivityListRequest,
  'page'
>) {
  return useInfiniteQuery({
    queryKey: ['ownerAssociationActivityList', query, size, status],
    queryFn: async ({ pageParam }) => {
      const response =
        await ownerAssociationRequestApi.getOwnerAssociationRequestActivityList({
          query,
          size,
          status,
          page: pageParam,
        });

      return addNextPage(response, pageParam, size);
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.pageInfo.nextPage,
  });
}

export function useCreateUserOwnerMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createUserOwnerMapping'],
    mutationFn: (params: OwnerAssociationRequestApiCreateUserOwnerMappingRequest) =>
      ownerAssociationRequestApi.createUserOwnerMapping(params),
    onSuccess: async () => {
      showSuccessToast({ message: 'Owner association created successfully' });
      await queryClient.invalidateQueries({
        queryKey: ['ownerAssociationRequestList'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['ownerAssociationActivityList'],
      });
    },
  });
}

export function useRemoveUserOwnerMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['removeUserOwnerMapping'],
    mutationFn: (params: OwnerAssociationRequestApiDeleteActiveUserOwnerMappingRequest) =>
      ownerAssociationRequestApi.deleteActiveUserOwnerMapping(params),
    onSuccess: async () => {
      showSuccessToast({ message: 'Association removed successfully' });
      await queryClient.invalidateQueries({
        queryKey: ['ownerAssociationRequestList'],
      });
    },
  });
}

export function useUpdateAssociationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateAssociationRequest'],
    mutationFn: async (
      params: OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest
    ) => ownerAssociationRequestApi.updateOwnerAssociationRequest(params),
    onSuccess: async () => {
      showSuccessToast({ message: 'Association request updated successfully' });
      await queryClient.invalidateQueries({
        queryKey: ['ownerAssociationRequestList'],
      });
    },
  });
}

export function useCreateOwnerAssociationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createOwnerAssociationRequest'],
    mutationFn: async (
      params: OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest
    ) => ownerAssociationRequestApi.createOwnerAssociationRequest(params),
    onSuccess: async () => {
      showSuccessToast({ message: 'Association request created successfully' });
      await queryClient.invalidateQueries({
        queryKey: ['ownerAssociationRequestList'],
      });
    },
  });
}

export function useGetProviderList() {
  return useQuery({
    queryKey: ['providerList'],
    queryFn: async () => ownerAssociationRequestApi.getAuthProviders(),
  });
}
