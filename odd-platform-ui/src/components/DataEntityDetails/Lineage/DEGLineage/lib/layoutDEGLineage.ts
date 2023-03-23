import ELK from 'elkjs/lib/elk.bundled';
import { useEffect, useMemo } from 'react';
import { layoutOptions } from 'components/DataEntityDetails/Lineage/DEGLineage/lib/constants';
import type {
  Node,
  Edge,
} from 'components/DataEntityDetails/Lineage/DEGLineage/lib/interfaces';
import { type SetStateAction, WritableAtom } from 'jotai';
import { Setter } from 'jotai/vanilla/typeUtils';

interface Params {
  nodes: Node[];
  edges: Edge[];
  setGraphWidth: (w: number) => void;
  setGraphHeight: (h: number) => void;
  setEdges: (e: Edge[]) => void;
  setNodes: (n: Node[]) => void;
  setIsLayouted: (b: boolean) => void;
  // setGraphWidth: Setter;
}

const elk = new ELK();

export default function layoutDEGLineage({
  nodes,
  edges,
  setGraphWidth,
  setNodes,
  setIsLayouted,
  setGraphHeight,
  setEdges,
}: Params) {
  const graph = {
    id: 'root',
    layoutOptions,
    children: nodes,
    edges,
  };

  elk.layout(graph).then(layoutedGraph => {
    setGraphWidth(layoutedGraph.width || 0);
    setGraphHeight(layoutedGraph.height || 0);
    setEdges(layoutedGraph.edges || []);
    setNodes(layoutedGraph.children || []);
    setIsLayouted(true);
  });
}
