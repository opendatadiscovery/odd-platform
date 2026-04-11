import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReferenceDataSearchFormData } from 'generated-sources';
import { referenceDataApi } from 'lib/api';

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
