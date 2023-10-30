import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { dataEntityApi } from 'lib/api';
import { showServerErrorToast, showSuccessToast } from 'lib/errorHandling';
import type {
  DataEntityGroupLineage,
  Edge,
  Node,
} from 'components/DataEntityDetails/Lineage/DEGLineage/lib/interfaces';
import type { DataEntityGroupList } from 'lib/interfaces';
import type { ErrorState } from 'redux/interfaces';
import type {
  DataEntityApiGetDataEntityGroupsItemsRequest,
  DataEntityApiUpdateStatusRequest,
} from 'generated-sources';

interface UseDataEntityMetricsProps {
  dataEntityId: number;
  enabled: boolean;
}

export function useDataEntityMetrics({
  dataEntityId,
  enabled,
}: UseDataEntityMetricsProps) {
  return useQuery({
    queryKey: ['dataEntityMetrics', dataEntityId],
    queryFn: async () =>
      dataEntityApi.getDataEntityMetrics({ dataEntityId }).catch(err => {
        showServerErrorToast(err, {
          additionalMessage: 'while loading metrics',
        });
      }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useDataEntityGroupLineage({ dataEntityId }: { dataEntityId: number }) {
  return useQuery({
    queryKey: ['dataEntityGroupLineage', dataEntityId],
    queryFn: () =>
      dataEntityApi.getDataEntityGroupsLineage({ dataEntityGroupId: dataEntityId }),
    gcTime: 0,
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
              status: node.status,
              isStale: node.isStale,
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
  });
}

export function useDataEntitiesUsage() {
  return useQuery({
    queryKey: ['dataEntitiesUsage'],
    queryFn: () => dataEntityApi.getDataEntitiesUsage(),
  });
}

interface UseDataEntityDetailsParams {
  dataEntityId: number;
  enabled?: boolean;
}

export function useDataEntityDetails({
  dataEntityId,
  enabled = true,
}: UseDataEntityDetailsParams) {
  return useQuery({
    queryKey: ['dataEntityDetails', dataEntityId],
    queryFn: () => dataEntityApi.getDataEntityDetails({ dataEntityId }),
    enabled,
  });
}

export function useGetDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: () => dataEntityApi.getDomains(),
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
  return useInfiniteQuery<
    DataEntityGroupList,
    ErrorState,
    InfiniteData<DataEntityGroupList>,
    ['dataEntityGroupItems', UseGetDataEntityGroupItems],
    number
  >({
    queryKey: ['dataEntityGroupItems', { dataEntityGroupId, size, query }],
    queryFn: async ({ pageParam }) => {
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
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.pageInfo.nextPage,
  });
}

export function useUpdateDataEntityStatus() {
  return useMutation({
    mutationFn: async (params: DataEntityApiUpdateStatusRequest) =>
      dataEntityApi.updateStatus(params),
    onSuccess: () => showSuccessToast({ message: 'Status successfully updated!' }),
  });
}
