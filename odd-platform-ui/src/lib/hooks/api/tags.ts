import { useQuery } from '@tanstack/react-query';
import { tagApi } from 'lib/api';
import type { TagApiGetPopularTagListRequest } from 'generated-sources';

export function useGetPopularTags(params: TagApiGetPopularTagListRequest) {
  return useQuery(['popularTags'], async () => {
    const { items } = await tagApi.getPopularTagList(params);

    return items;
  });
}
