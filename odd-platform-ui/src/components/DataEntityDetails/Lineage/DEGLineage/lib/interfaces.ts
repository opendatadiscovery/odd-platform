import type { DataEntityLineageNode } from 'generated-sources';
import type { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled';

export type NodeData = Omit<
  DataEntityLineageNode,
  'id' | 'groupIdList' | 'parentsCount' | 'childrenCount'
>;

export interface Node extends ElkNode {
  id: string;
  height?: number;
  width?: number;
  data?: NodeData;
  fullView?: boolean;
}

export type Edge = ElkExtendedEdge & { isHighlighted?: boolean };

export interface DataEntityGroupLineage {
  nodes: Node[];
  edges: Edge[];
}

export type DEGLineageQueryParams = {
  full: boolean; // full or compact view
  x: number | undefined; // zoom x position
  y: number | undefined; // zoom y position
  s: number | undefined; // scale
};
