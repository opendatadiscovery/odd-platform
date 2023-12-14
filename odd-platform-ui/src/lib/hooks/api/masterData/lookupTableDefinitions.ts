import { useMutation } from '@tanstack/react-query';
import { referenceDataApi } from 'lib/api';
import { showSuccessToast } from 'lib/errorHandling';
import type { ReferenceDataApiCreateColumnsForLookupTableRequest } from 'generated-sources';

export function useCreateLookupTableDefinition() {
  return useMutation({
    mutationKey: ['createLookupTableDefinition'],
    mutationFn: async (params: ReferenceDataApiCreateColumnsForLookupTableRequest) =>
      referenceDataApi.createColumnsForLookupTable(params),
    onSuccess: () => {
      showSuccessToast({
        message: 'Column successfully created!',
      });
    },
  });
}
