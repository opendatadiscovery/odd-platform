import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { addNextPage } from 'lib/hooks/api/utils';
import { queryExampleApi } from 'lib/api';
import type { QueryExampleApiGetQueryExampleSearchResultsRequest } from 'generated-sources';

export function useCreateQueryExampleSearchId() {
  return useQuery({
    queryKey: ['createQueryExampleSearchId'],
    queryFn: async () =>
      queryExampleApi.queryExamplesSearch({ queryExampleSearchFormData: { query: '' } }),
  });
}

type UseSearchQueryExamples = Omit<
  QueryExampleApiGetQueryExampleSearchResultsRequest,
  'page'
> & {
  enabled: boolean;
};
export function useSearchQueryExamples({
  searchId,
  size,
  enabled,
}: UseSearchQueryExamples) {
  return useInfiniteQuery({
    queryKey: ['searchQueryExamples', searchId, size],
    queryFn: async ({ pageParam }) => {
      const response = await queryExampleApi.getQueryExampleSearchResults({
        searchId,
        size,
        page: pageParam,
      });

      return addNextPage(response, pageParam, size);
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.pageInfo.nextPage,
    enabled,
  });
}
