import { useQuery } from '@tanstack/react-query';
import type { TagApiGetPopularTagListRequest } from 'generated-sources/apis/TagApi';
import { tagApi } from 'lib/api';

export function useGetTagList(params: TagApiGetPopularTagListRequest) {
  return useQuery({
    queryKey: ['tagList', params],
    queryFn: async () => tagApi.getPopularTagList(params),
  });
}
