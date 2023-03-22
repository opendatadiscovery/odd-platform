import ELK from 'elkjs/lib/elk.bundled';
import { useEffect, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import type { DataEntityGroupLineage } from '../interfaces';
import { edgesAtom, graphHeightAtom, graphWidthAtom, nodesAtom } from '../atoms';
import { layoutOptions, NODE_WIDTH } from '../constants';

const elk = new ELK();

export default function useDEGLineageLayout({
  nodes: rawNodes,
  edges: rawEdges,
}: DataEntityGroupLineage) {
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);
  const setGraphWidth = useSetAtom(graphWidthAtom);
  const setGraphHeight = useSetAtom(graphHeightAtom);

  const nodesWithSize = useMemo(
    () =>
      rawNodes.map(node => ({
        ...node,
        id: node.id,
        width: NODE_WIDTH,
        height: 70,
      })),
    [rawNodes]
  );
  const graph = useMemo(
    () => ({
      id: 'root',
      layoutOptions,
      children: nodesWithSize,
      edges: rawEdges,
    }),
    [rawNodes, rawEdges]
  );

  useEffect(() => {
    elk.layout(graph).then(layoutedGraph => {
      setGraphWidth(layoutedGraph.width || 0);
      setGraphHeight(layoutedGraph.height || 0);
      setEdges(layoutedGraph.edges || []);
      setNodes(layoutedGraph.children || []);
    });
  }, [graph]);
}
