import { useCallback, useMemo } from 'react';
import { useAtom } from 'jotai';
import { edgesAtom, graphHeightAtom, graphWidthAtom, nodesAtom } from '../atoms';

const useDEGLineage = () => {
  const [nodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const [graphWidth] = useAtom(graphWidthAtom);
  const [graphHeight] = useAtom(graphHeightAtom);

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
