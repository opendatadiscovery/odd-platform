import { useQuery } from '@tanstack/react-query';
import type { DataSourceApiGetDataSourceListRequest } from 'generated-sources';
import { dataSourceApi } from 'lib/api';

export function useGetDataSourceList(params: DataSourceApiGetDataSourceListRequest) {
  return useQuery({
    queryKey: ['dataSourceList', params],
    queryFn: async () => dataSourceApi.getDataSourceList(params),
  });
}
