import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LookupTable, LookupTableRow } from 'generated-sources';
import { referenceDataApi } from 'lib/api';
import { showSuccessToast } from 'lib/errorHandling';
import { referenceDataQueryKeys } from './referenceData';

export function useDeleteLookupTableRow(lookupTableId: LookupTable['tableId']) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteLookupTableRow'],
    mutationFn: (rowId: LookupTableRow['rowId']) =>
      referenceDataApi.deleteLookupTableRow({ rowId, lookupTableId }),
    onSuccess: async () => {
      showSuccessToast({ message: 'Row successfully deleted!' });
      await queryClient.invalidateQueries({
        queryKey: referenceDataQueryKeys.referenceData(lookupTableId),
      });
    },
  });
}
