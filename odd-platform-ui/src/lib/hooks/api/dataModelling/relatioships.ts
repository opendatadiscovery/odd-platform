import { useInfiniteQuery } from '@tanstack/react-query';
import { relationshipApi } from 'lib/api';
import { addNextPage } from '../utils';
import type { RelationshipApiGetRelationshipsRequest } from 'generated-sources';

export function useSearchRelationships({
  query,
  size,
  type,
}: Omit<RelationshipApiGetRelationshipsRequest, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['searchRelationships', query, size],
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
