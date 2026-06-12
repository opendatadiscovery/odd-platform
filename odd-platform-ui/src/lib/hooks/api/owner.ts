import { useQuery } from '@tanstack/react-query';
import type { OwnerApiGetOwnerListRequest } from 'generated-sources';
import { ownerApi } from 'lib/api';

export function useGetOwnerList(params: OwnerApiGetOwnerListRequest) {
  return useQuery({
    queryKey: ['ownerList', params],
    queryFn: async () => ownerApi.getOwnerList(params),
  });
}
