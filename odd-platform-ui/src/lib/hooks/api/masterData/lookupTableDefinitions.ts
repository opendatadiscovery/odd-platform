import { useMutation } from '@tanstack/react-query';
import { referenceDataApi } from 'lib/api';
import { showSuccessToast } from 'lib/errorHandling';
import type {
  ReferenceDataApiCreateColumnsForLookupTableRequest,
  ReferenceDataApiDeleteLookupTableFieldRequest,
} from 'generated-sources';

export function useCreateLookupTableDefinition() {
  return useMutation({
    mutationKey: ['createLookupTableDefinition'],
    mutationFn: async (params: ReferenceDataApiCreateColumnsForLookupTableRequest) =>
      referenceDataApi.createColumnsForLookupTable(params),
    onSuccess: () => showSuccessToast({ message: 'Column successfully created!' }),
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
