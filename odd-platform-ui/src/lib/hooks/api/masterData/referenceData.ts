import { useInfiniteQuery } from '@tanstack/react-query';
import type {
  LookupTable,
  ReferenceDataApiGetLookupTableRowListRequest,
} from 'generated-sources';
import { referenceDataApi } from 'lib/api';
import { addNextPage } from '../utils';

export const referenceDataQueryKeys = {
  referenceData: (lookupTableId?: LookupTable['tableId']) => [
    'referenceData',
    lookupTableId,
  ],
} as const;

interface GetReferenceDataParams {
  lookupTableId: LookupTable['tableId'];
  size: ReferenceDataApiGetLookupTableRowListRequest['size'];
  enabled?: boolean;
}
export function useGetReferenceData({ lookupTableId, size }: GetReferenceDataParams) {
  return useInfiniteQuery({
    queryKey: referenceDataQueryKeys.referenceData(lookupTableId),
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
