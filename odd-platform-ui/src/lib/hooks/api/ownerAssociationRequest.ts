import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  OwnerAssociationRequestApiCreateUserOwnerMappingRequest,
  OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest,
} from 'generated-sources/apis';
import { ownerAssociationRequestApi } from 'lib/api';
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

export function useCreateUserOwnerMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createUserOwnerMapping'],
    mutationFn: (params: OwnerAssociationRequestApiCreateUserOwnerMappingRequest) =>
      ownerAssociationRequestApi.createUserOwnerMapping(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['ownerAssociationRequestList'],
      });
    },
  });
}
