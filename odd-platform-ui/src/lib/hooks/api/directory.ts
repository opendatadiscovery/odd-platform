import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { directoryApi } from 'lib/api';
import type {
  DirectoryApiGetDatasourceEntitiesRequest,
  DirectoryApiGetDatasourceEntityTypesRequest,
  DirectoryApiGetDirectoryDatasourceListRequest,
} from 'generated-sources';
import type { ErrorState } from 'redux/interfaces';
import type { DataSourceEntityList } from 'lib/interfaces';

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
  return useInfiniteQuery<DataSourceEntityList, ErrorState, DataSourceEntityList>({
    queryKey: ['directoryDataSourceEntities', { dataSourceId, size, typeId }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await directoryApi.getDatasourceEntities({
        dataSourceId,
        size,
        typeId,
        page: pageParam,
      });

      const totalItems = response.entities.pageInfo.total;
      const totalPageCount = Math.ceil(totalItems / size);
      let nextPage;

      if (pageParam < totalPageCount) {
        nextPage = pageParam + 1;
      }

      return {
        ...response,
        entities: {
          ...response.entities,
          pageInfo: { ...response.entities.pageInfo, nextPage },
        },
      };
    },
    getNextPageParam: lastPage => lastPage.entities.pageInfo.nextPage,
    enabled,
  });
}
