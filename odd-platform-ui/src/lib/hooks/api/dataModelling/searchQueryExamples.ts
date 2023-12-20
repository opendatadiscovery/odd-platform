import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { addNextPage } from 'lib/hooks/api/utils';
import { queryExampleApi } from 'lib/api';
import type {
  QueryExampleApiGetQueryExampleSearchResultsRequest,
  QueryExampleApiUpdateQueryExampleSearchFacetListRequest,
  QueryExampleApiGetQueryExampleSearchFacetListRequest,
} from 'generated-sources';

export function useCreateQueryExampleSearchId() {
  return useMutation({
    mutationKey: ['createQueryExampleSearchId'],
    mutationFn: async (query?: string) =>
      queryExampleApi.queryExamplesSearch({ queryExampleSearchFormData: { query } }),
  });
}

export function useGetQueryExampleSearchFacets({
  enabled,
  searchId,
}: QueryExampleApiGetQueryExampleSearchFacetListRequest & { enabled: boolean }) {
  return useQuery({
    queryKey: ['getQueryExampleSearchFacets', searchId],
    queryFn: async () => queryExampleApi.getQueryExampleSearchFacetList({ searchId }),
    enabled,
  });
}

export function useUpdateQueryExampleSearchFacets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateQueryExampleSearchFacets'],
    mutationFn: async ({
      searchId,
      queryExampleSearchFormData,
    }: QueryExampleApiUpdateQueryExampleSearchFacetListRequest) =>
      queryExampleApi.updateQueryExampleSearchFacetList({
        searchId,
        queryExampleSearchFormData,
      }),
    onSuccess: async () =>
      await queryClient.invalidateQueries({ queryKey: ['searchQueryExamples'] }),
  });
}

type UseSearchQueryExamples = Omit<
  QueryExampleApiGetQueryExampleSearchResultsRequest,
  'page'
>;
export function useSearchQueryExamples({ searchId, size }: UseSearchQueryExamples) {
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
  });
}
