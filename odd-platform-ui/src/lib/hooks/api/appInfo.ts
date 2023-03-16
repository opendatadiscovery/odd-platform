import { useQuery } from '@tanstack/react-query';
import { appInfoApi, linksApi } from 'lib/api';

export function useAppInfo() {
  return useQuery(['appInfo'], () => appInfoApi.getAppInfo(), {
    select: data => data.projectVersion,
  });
}

export function useAppLinks() {
  return useQuery(['appLinks'], () => linksApi.getLinks(), {
    select: data => data.items,
  });
}
