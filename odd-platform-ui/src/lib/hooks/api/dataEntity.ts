import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { dataEntityApi } from 'lib/api';
import { showServerErrorToast } from 'lib/errorHandling';
import type {
  DataEntityGroupLineage,
  Edge,
  Node,
} from 'components/DataEntityDetails/Lineage/DEGLineage/lib/interfaces';
import type { DataEntityGroupList } from 'lib/interfaces';
import type { ErrorState } from 'redux/interfaces';
import type { DataEntityApiGetDataEntityGroupsItemsRequest } from 'generated-sources';

interface UseDataEntityMetricsProps {
  dataEntityId: number;
  enabled: boolean;
}

export function useDataEntityMetrics({
  dataEntityId,
  enabled,
}: UseDataEntityMetricsProps) {
  return useQuery(
    ['dataEntityMetrics', dataEntityId],
    () => dataEntityApi.getDataEntityMetrics({ dataEntityId }),
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: err =>
        showServerErrorToast(err as Response, {
          additionalMessage: 'while loading metrics',
        }),
      enabled,
    }
  );
}

export function useDataEntityGroupLineage({ dataEntityId }: { dataEntityId: number }) {
  return useQuery(
    ['dataEntityGroupLineage', dataEntityId],
    () => dataEntityApi.getDataEntityGroupsLineage({ dataEntityGroupId: dataEntityId }),
    {
      cacheTime: 0,
      select: (data): DataEntityGroupLineage =>
        data.items.reduce(
          (memo, lineage) => {
            const nodes = lineage.nodes.map<Node>(node => ({
              id: String(node.id),
              data: {
                oddrn: node.oddrn,
                externalName: node.externalName,
                internalName: node.internalName,
                dataSource: node.dataSource,
                entityClasses: node.entityClasses,
              },
            }));
            const edges = lineage.edges.map<Edge>(({ sourceId, targetId }) => ({
              id: `${sourceId}-${targetId}`,
              targets: [String(targetId)],
              sources: [String(sourceId)],
            }));

            return {
              ...memo,
              nodes: [...memo.nodes, ...nodes],
              edges: [...memo.edges, ...edges],
            };
          },
          { nodes: [], edges: [] } as DataEntityGroupLineage
        ),
    }
  );
}

export function useDataEntitiesUsage() {
  return useQuery(['dataEntitiesUsage'], () => dataEntityApi.getDataEntitiesUsage());
}

interface UseDataEntityDetailsParams {
  dataEntityId: number;
  enabled?: boolean;
}

export function useDataEntityDetails({
  dataEntityId,
  enabled = true,
}: UseDataEntityDetailsParams) {
  return useQuery(
    ['dataEntityDetails', dataEntityId],
    () => dataEntityApi.getDataEntityDetails({ dataEntityId }),
    { enabled }
  );
}

export function useGetDomains() {
  return useQuery(['domains'], () => dataEntityApi.getDomains(), {
    select: data => data.items,
  });
}

type UseGetDataEntityGroupItems = Omit<
  DataEntityApiGetDataEntityGroupsItemsRequest,
  'page'
>;

export function useGetDataEntityGroupItems({
  dataEntityGroupId,
  size,
  query,
}: UseGetDataEntityGroupItems) {
  return useInfiniteQuery<DataEntityGroupList, ErrorState, DataEntityGroupList>(
    ['dataEntityGroupItems', { dataEntityGroupId, size, query }],
    async ({ pageParam = 1 }) => {
      const response = await dataEntityApi.getDataEntityGroupsItems({
        dataEntityGroupId,
        size,
        query,
        page: pageParam,
      });

      const totalItems = response.pageInfo.total;
      const totalPageCount = Math.ceil(totalItems / size);
      let nextPage;

      if (pageParam < totalPageCount) {
        nextPage = pageParam + 1;
      }

      return {
        ...response,
        pageInfo: { ...response.pageInfo, nextPage },
      };
    },
    { getNextPageParam: lastPage => lastPage.pageInfo.nextPage }
  );
}
