import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { relationshipApi } from 'lib/api';
import type { RelationshipApiGetRelationshipsRequest } from 'generated-sources';
import { addNextPage } from '../utils';

export function useGetEDRRelationshipById(relationshipId: number) {
  return useQuery({
    queryKey: ['getERDRelationshipById', relationshipId],
    queryFn: async () => relationshipApi.getERDRelationshipById({ relationshipId }),
  });
}

export function useGetGraphRelationshipById(relationshipId: number) {
  return useQuery({
    queryKey: ['getGraphRelationshipById', relationshipId],
    queryFn: async () => relationshipApi.getGraphRelationshipById({ relationshipId }),
  });
}

export function useSearchRelationships({
  query,
  size,
  type,
}: Omit<RelationshipApiGetRelationshipsRequest, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['searchRelationships', query, size, type],
    queryFn: async ({ pageParam }) => {
      const response = await relationshipApi.getRelationships({
        query,
        size,
        type,
        page: pageParam,
      });

      return addNextPage(response, pageParam, size);
    },

    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.pageInfo.nextPage,
  });
}
