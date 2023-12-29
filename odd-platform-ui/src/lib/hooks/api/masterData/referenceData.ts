import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  LookupTable,
  ReferenceDataApiAddDataToLookupTableRequest,
  ReferenceDataApiGetLookupTableRowListRequest,
} from 'generated-sources';
import { referenceDataApi } from 'lib/api';
import { addNextPage } from '../utils';
import { showSuccessToast } from '../../../errorHandling';

export const referenceDataQueryKeys = {
  referenceData: () => ['referenceData'],
} as const;

interface GetReferenceDataParams {
  lookupTableId: LookupTable['tableId'];
  size: ReferenceDataApiGetLookupTableRowListRequest['size'];
  enabled?: boolean;
}
export function useGetReferenceData({ lookupTableId, size }: GetReferenceDataParams) {
  return useInfiniteQuery({
    queryKey: referenceDataQueryKeys.referenceData(),
    queryFn: async ({ pageParam }) => {
      const response = await referenceDataApi.getLookupTableRowList({
        lookupTableId,
        size,
        page: pageParam,
      });

      return addNextPage(response, pageParam, size);
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.pageInfo.nextPage,
  });
}

export function useCreateReferenceData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['createReferenceData'],
    mutationFn: async (params: ReferenceDataApiAddDataToLookupTableRequest) =>
      referenceDataApi.addDataToLookupTable(params),
    onSuccess: async () => {
      showSuccessToast({ message: 'Reference data successfully created' });
      await queryClient.invalidateQueries({
        queryKey: referenceDataQueryKeys.referenceData(),
      });
    },
  });
}
