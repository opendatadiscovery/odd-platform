import { useQuery } from '@tanstack/react-query';
import { appInfoApi, linksApi } from 'lib/api';

export function useAppInfo() {
  return useQuery({
    queryKey: ['appInfo'],
    queryFn: () => appInfoApi.getAppInfo(),
  });
}

export function useAppLinks() {
  return useQuery({
    queryKey: ['appLinks'],
    queryFn: () => linksApi.getLinks(),
    select: data => data.items,
  });
}
