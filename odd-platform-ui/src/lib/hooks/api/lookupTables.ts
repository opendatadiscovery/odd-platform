import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { LookupTableFormData, ReferenceDataSearchFormData } from 'generated-sources';
import { showSuccessToast } from 'lib/errorHandling';
import { referenceDataApi } from '../../api';
import { addNextPage } from './utils';

interface SearchLookupTablesParams {
  searchId: string;
  size: number;
  enabled: boolean;
}
export function useSearchLookupTables({
  searchId,
  size,
  enabled,
}: SearchLookupTablesParams) {
  return useInfiniteQuery({
    queryKey: ['searchLookupTables', searchId, size],
    queryFn: async ({ pageParam }) => {
      const response = await referenceDataApi.getReferenceDataSearchResults({
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

interface GetReferenceDataSearchParams {
  searchId: string;
  enabled?: boolean;
}
export function useGetReferenceDataSearch({
  searchId,
  enabled,
}: GetReferenceDataSearchParams) {
  return useQuery({
    queryKey: ['referenceDataSearch', searchId],
    queryFn: () => referenceDataApi.getReferenceDataSearchFacetList({ searchId }),
    enabled,
  });
}

export function useCreateReferenceDataSearch() {
  return useMutation({
    mutationKey: ['createReferenceDataSearch'],
    mutationFn: (query?: string) =>
      referenceDataApi.referenceDataSearch({ referenceDataSearchFormData: { query } }),
  });
}

export function useUpdateReferenceDataSearch(searchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateReferenceDataSearch', searchId],
    mutationFn: (referenceDataSearchFormData: ReferenceDataSearchFormData) =>
      referenceDataApi.updateReferenceDataSearchFacetList({
        searchId,
        referenceDataSearchFormData,
      }),
    onSuccess: async () =>
      await queryClient.invalidateQueries({ queryKey: ['searchLookupTables'] }),
  });
}

export function useCreateLookupTable() {
  return useMutation({
    mutationKey: ['createLookupTable'],
    mutationFn: (formData: LookupTableFormData) =>
      referenceDataApi.createReferenceTable({
        lookupTableFormData: formData,
      }),
    onSuccess: () => {
      showSuccessToast({ message: 'Reference Lookup Table successfully created!' });
    },
  });
}
