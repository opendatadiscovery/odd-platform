import { useInfiniteQuery } from '@tanstack/react-query';
import type {
  LookupTable,
  ReferenceDataApiGetLookupTableRowListRequest,
} from 'generated-sources';
import { referenceDataApi } from 'lib/api';
import { addNextPage } from '../utils';

interface GetReferenceDataParams {
  lookupTableId: LookupTable['tableId'];
  size: ReferenceDataApiGetLookupTableRowListRequest['size'];
  enabled?: boolean;
}
export function useGetReferenceData({
  lookupTableId,
  size,
  enabled,
}: GetReferenceDataParams) {
  return useInfiniteQuery({
    queryKey: ['referenceData', lookupTableId],
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
    enabled,
  });
}
