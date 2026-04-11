import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  LookupTable,
  ReferenceDataApiCreateReferenceTableRequest,
  ReferenceDataApiUpdateLookupTableRequest,
} from 'generated-sources';
import { showSuccessToast } from 'lib/errorHandling';
import { referenceDataApi } from 'lib/api';
import { addNextPage } from '../utils';

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

interface GetLookupTableParams {
  lookupTableId: LookupTable['tableId'];
  enabled?: boolean;
}
export function useGetLookupTable({ lookupTableId }: GetLookupTableParams) {
  return useQuery({
    queryKey: ['lookupTable', lookupTableId],
    queryFn: () => referenceDataApi.getLookupTableById({ lookupTableId }),
  });
}

export function useCreateLookupTable() {
  return useMutation({
    mutationKey: ['createLookupTable'],
    mutationFn: (params: ReferenceDataApiCreateReferenceTableRequest) =>
      referenceDataApi.createReferenceTable(params),
    onSuccess: () => {
      showSuccessToast({ message: 'Reference Lookup Table successfully created!' });
    },
  });
}

export function useUpdateLookupTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateLookupTable'],
    mutationFn: ({
      lookupTableId,
      lookupTableUpdateFormData,
    }: ReferenceDataApiUpdateLookupTableRequest) =>
      referenceDataApi.updateLookupTable({
        lookupTableId,
        lookupTableUpdateFormData,
      }),
    onSuccess: async () => {
      showSuccessToast({ message: 'Reference Lookup Table successfully updated!' });
      await queryClient.invalidateQueries({ queryKey: ['searchLookupTables'] });
    },
  });
}

export function useDeleteLookupTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteLookupTable'],
    mutationFn: (lookupTableId: LookupTable['tableId']) =>
      referenceDataApi.deleteLookupTable({ lookupTableId }),
    onSuccess: async () => {
      showSuccessToast({ message: 'Reference Lookup Table successfully deleted!' });
      await queryClient.invalidateQueries({ queryKey: ['searchLookupTables'] });
    },
  });
}
