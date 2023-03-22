import { useAppParams } from 'lib/hooks';
import { useDataEntityLineage } from 'lib/hooks/api';
import { useCallback, useMemo } from 'react';
import uniqBy from 'lodash/uniqBy';
import { useAtom } from 'jotai';
import { edgesAtom, graphHeightAtom, graphWidthAtom, nodesAtom } from '../atoms';
import useDEGLineageLayout from './useDEGLineageLayout';

const useDEGLineage = () => {
  const { dataEntityId } = useAppParams();
  const data = useDataEntityLineage({ dataEntityId });

  const [nodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const [graphWidth] = useAtom(graphWidthAtom);
  const [graphHeight] = useAtom(graphHeightAtom);

  const rawNodes = useMemo(
    () => uniqBy([...(data[0]?.data?.nodes || [])], 'id'),
    [data[0]?.data?.nodes]
  );
  const rawEdges = useMemo(
    () => [...(data[0]?.data?.edges || [])],
    [data[0]?.data?.edges]
  );

  useDEGLineageLayout({
    nodes: rawNodes,
    edges: rawEdges,
  });

  const handleOnNodeMouseEnter = useCallback(
    (nodeId: string) => {
      setEdges(prev =>
        prev.map(edge => {
          if (
            edge.sources.some(source => source === nodeId) ||
            edge.targets.some(target => target === nodeId)
          ) {
            return { ...edge, isHighlighted: true };
          }

          return edge;
        })
      );
    },
    [setEdges]
  );

  const handleOnNodeMouseLeave = useCallback(() => {
    setEdges(prev => prev.map(edge => ({ ...edge, isHighlighted: false })));
  }, [setEdges]);

  return useMemo(
    () => ({
      nodes,
      edges,
      graphWidth,
      graphHeight,
      handleOnNodeMouseEnter,
      handleOnNodeMouseLeave,
    }),
    [
      nodes,
      edges,
      graphWidth,
      graphHeight,
      handleOnNodeMouseEnter,
      handleOnNodeMouseLeave,
    ]
  );
};

export default useDEGLineage;
