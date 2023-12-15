import { useMutation, useQuery } from '@tanstack/react-query';
import { referenceDataApi } from 'lib/api';
import { showSuccessToast } from 'lib/errorHandling';
import type {
  ReferenceDataApiCreateColumnsForLookupTableRequest,
  ReferenceDataApiDeleteLookupTableFieldRequest,
  ReferenceDataApiGetLookupTableFieldRequest,
  ReferenceDataApiUpdateLookupTableFieldRequest,
} from 'generated-sources';

export function useCreateLookupTableDefinition() {
  return useMutation({
    mutationKey: ['createLookupTableDefinition'],
    mutationFn: async (params: ReferenceDataApiCreateColumnsForLookupTableRequest) =>
      referenceDataApi.createColumnsForLookupTable(params),
    onSuccess: () => showSuccessToast({ message: 'Column successfully created!' }),
  });
}

export function useGetLookupTableDefinition({
  lookupTableId,
  columnId,
  enabled,
}: ReferenceDataApiGetLookupTableFieldRequest & { enabled?: boolean }) {
  return useQuery({
    queryKey: ['getLookupTableDefinition', lookupTableId, columnId],
    queryFn: () => referenceDataApi.getLookupTableField({ lookupTableId, columnId }),
    enabled,
  });
}

export function useUpdateLookupTableDefinition() {
  return useMutation({
    mutationKey: ['updateLookupTableDefinition'],
    mutationFn: async (params: ReferenceDataApiUpdateLookupTableFieldRequest) =>
      referenceDataApi.updateLookupTableField(params),
    onSuccess: () => showSuccessToast({ message: 'Column successfully updated!' }),
  });
}

export function useDeleteLookupTableDefinition() {
  return useMutation({
    mutationKey: ['deleteLookupTableDefinition'],
    mutationFn: async (params: ReferenceDataApiDeleteLookupTableFieldRequest) =>
      referenceDataApi.deleteLookupTableField(params),
    onSuccess: () => showSuccessToast({ message: 'Column successfully deleted!' }),
  });
}
