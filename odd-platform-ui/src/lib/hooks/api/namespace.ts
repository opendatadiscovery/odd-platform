import { useQuery } from '@tanstack/react-query';
import type { NamespaceApiGetNamespaceListRequest } from 'generated-sources/apis/NamespaceApi';
import { namespaceApi } from 'lib/api';

export function useGetNamespaceList(params: NamespaceApiGetNamespaceListRequest) {
  return useQuery({
    queryKey: ['namespaceList', params],
    queryFn: async () => namespaceApi.getNamespaceList(params),
  });
}
