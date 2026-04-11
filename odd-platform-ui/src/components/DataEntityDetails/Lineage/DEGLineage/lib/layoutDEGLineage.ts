import ELK from 'elkjs/lib/elk.bundled';
import { layoutOptions } from './constants';
import type { Edge, Node } from './interfaces';

interface Params {
  nodes: Node[];
  edges: Edge[];
  setGraphWidth: (w: number) => void;
  setGraphHeight: (h: number) => void;
  setEdges: (e: Edge[]) => void;
  setNodes: (n: Node[]) => void;
  setIsLayouted: (b: boolean) => void;
}

export default function layoutDEGLineage({
  nodes,
  edges,
  setGraphWidth,
  setNodes,
  setIsLayouted,
  setGraphHeight,
  setEdges,
}: Params) {
  const elk = new ELK();

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
