import { type InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { directoryApi } from 'lib/api';
import type {
  DirectoryApiGetDatasourceEntitiesRequest,
  DirectoryApiGetDatasourceEntityTypesRequest,
  DirectoryApiGetDirectoryDatasourceListRequest,
} from 'generated-sources';
import type { ErrorState } from 'redux/interfaces';
import type { DataSourceEntityList } from 'lib/interfaces';
import { addNextPage } from './utils';

export function useGetDataSourceTypes() {
  return useQuery({
    queryKey: ['dataSourceTypes'],
    queryFn: async () => {
      const { items } = await directoryApi.getDataSourceTypes();

      return items;
    },
  });
}

export function useGetDirectoryDataSources(
  params: DirectoryApiGetDirectoryDatasourceListRequest
) {
  return useQuery({
    queryKey: ['directoryDataSources', params.prefix],
    queryFn: () => directoryApi.getDirectoryDatasourceList(params),
  });
}

export function useGetDataSourceEntityTypes(
  params: DirectoryApiGetDatasourceEntityTypesRequest
) {
  return useQuery({
    queryKey: ['directoryDataSourceEntityTypes', params.dataSourceId],
    queryFn: () => directoryApi.getDatasourceEntityTypes(params),
  });
}

type UseGetDataSourceEntities = Omit<DirectoryApiGetDatasourceEntitiesRequest, 'page'> & {
  enabled: boolean;
};

export function useGetDataSourceEntities({
  dataSourceId,
  size,
  typeId,
  enabled,
}: UseGetDataSourceEntities) {
  return useInfiniteQuery<
    DataSourceEntityList,
    ErrorState,
    InfiniteData<DataSourceEntityList>,
    ['directoryDataSourceEntities', Omit<UseGetDataSourceEntities, 'enabled'>],
    number
  >({
    queryKey: ['directoryDataSourceEntities', { dataSourceId, size, typeId }],
    queryFn: async ({ pageParam }) => {
      const response = await directoryApi.getDatasourceEntities({
        dataSourceId,
        size,
        typeId,
        page: pageParam,
      });

      return {
        ...response,
        entities: {
          ...addNextPage(response.entities, pageParam, size),
        },
      };
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.entities.pageInfo.nextPage,
    enabled,
  });
}
