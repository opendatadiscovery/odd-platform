import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { directoryApi } from 'lib/api';
import type {
  DirectoryApiGetDatasourceEntitiesRequest,
  DirectoryApiGetDatasourceEntityTypesRequest,
  DirectoryApiGetDirectoryDatasourceListRequest,
} from 'generated-sources';

export function useGetDataSourceTypes() {
  return useQuery(['dataSourceTypes'], async () => {
    const { items } = await directoryApi.getDataSourceTypes();

    return items;
  });
}

export function useGetDirectoryDataSources(
  params: DirectoryApiGetDirectoryDatasourceListRequest
) {
  return useQuery(['directoryDataSources', params.prefix], () =>
    directoryApi.getDirectoryDatasourceList(params)
  );
}

export function useGetDataSourceEntityTypes(
  params: DirectoryApiGetDatasourceEntityTypesRequest
) {
  return useQuery(['directoryDataSourceEntityTypes', params.dataSourceId], () =>
    directoryApi.getDatasourceEntityTypes(params)
  );
}

type UseGetDataSourceEntities = Omit<DirectoryApiGetDatasourceEntitiesRequest, 'page'>;

export function useGetDataSourceEntities({
  dataSourceId,
  size,
  typeId,
}: UseGetDataSourceEntities) {
  return useInfiniteQuery(
    ['directoryDataSourceEntities', { dataSourceId, size, typeId }],
    ({ pageParam = 1 }) =>
      directoryApi.getDatasourceEntities({ dataSourceId, size, typeId, page: pageParam }),
    {
      getNextPageParam: (lastPage, allPages) =>
        lastPage.pageInfo.hasNext ? allPages.length + 1 : undefined,
    }
  );
}
