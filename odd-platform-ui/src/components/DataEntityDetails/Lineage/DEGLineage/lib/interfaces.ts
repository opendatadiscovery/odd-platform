import type { DataEntityLineageNode } from 'generated-sources';
import type { ElkExtendedEdge, ElkNode } from 'elkjs';

export type NodeData = Omit<DataEntityLineageNode, 'id' | 'groupIdList'>;

export interface Node extends ElkNode {
  id: string;
  height?: number;
  width?: number;
  data?: NodeData;
}

export type Edge = ElkExtendedEdge & { isHighlighted?: boolean };

export interface DataEntityGroupLineage {
  nodes: Node[];
  edges: Edge[];
}
