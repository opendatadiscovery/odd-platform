import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { dataModellingApi } from 'lib/api';
import type { DataModelingApiGetDataModelingSearchResultsRequest } from 'generated-sources';
import { addNextPage } from 'lib/hooks/api/utils';

export function useCreateQueryExampleSearchId() {
  return useQuery({
    queryKey: ['createQueryExampleSearchId'],
    queryFn: async () =>
      dataModellingApi.dataModelingSearch({ dataModelingSearchFormData: { query: '' } }),
  });
}

export function useSearchQueryExamples({
  searchId,
  page,
  size,
  enabled,
}: DataModelingApiGetDataModelingSearchResultsRequest & { enabled: boolean }) {
  return useInfiniteQuery({
    queryKey: ['searchQueryExamples', searchId, page, size],
    queryFn: async ({ pageParam }) => {
      const response = await dataModellingApi.getDataModelingSearchResults({
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
