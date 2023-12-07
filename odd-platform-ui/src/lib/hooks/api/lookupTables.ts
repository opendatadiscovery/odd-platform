import { useMutation, useQuery } from '@tanstack/react-query';
import type { ReferenceDataSearchFormData } from 'generated-sources';
import { referenceDataApi } from '../../api';

interface SearchLookupTablesParams {
  searchId: string;
  enabled?: boolean;
}
export function useSearchLookupTables({ searchId, enabled }: SearchLookupTablesParams) {
  return useQuery({
    queryKey: ['referenceData', searchId],
    queryFn: () => referenceDataApi.getReferenceDataSearchFacetList({ searchId }),
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
  return useMutation({
    mutationKey: ['updateReferenceDataSearch', searchId],
    mutationFn: (referenceDataSearchFormData: ReferenceDataSearchFormData) =>
      referenceDataApi.updateReferenceDataSearchFacetList({
        searchId,
        referenceDataSearchFormData,
      }),
  });
}
