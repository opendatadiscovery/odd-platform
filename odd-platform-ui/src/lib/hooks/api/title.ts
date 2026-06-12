import { useQuery } from '@tanstack/react-query';
import type { TitleApiGetTitleListRequest } from 'generated-sources/apis/TitleApi';
import { titleApi } from 'lib/api';

export function useGetTitleList(params: TitleApiGetTitleListRequest) {
  return useQuery({
    queryKey: ['titleList', params],
    queryFn: async () => titleApi.getTitleList(params),
  });
}
