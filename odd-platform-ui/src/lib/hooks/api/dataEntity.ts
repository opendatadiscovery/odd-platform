import { dataEntityApi } from 'lib/api';
import { showServerErrorToast } from 'lib/errorHandling';
import { useQuery } from '@tanstack/react-query';
import type {
  DataEntityGroupLineage,
  Edge,
  Node,
} from 'components/DataEntityDetails/Lineage/DEGLineage/lib/interfaces';

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
