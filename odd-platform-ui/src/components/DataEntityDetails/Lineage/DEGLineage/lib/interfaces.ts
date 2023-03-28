import type { DataEntityLineageNode } from 'generated-sources';
// import type { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled';

export type NodeData = Omit<
  DataEntityLineageNode,
  'id' | 'groupIdList' | 'parentsCount' | 'childrenCount'
>;

export interface ElkShape {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface ElkNode extends ElkShape {
  id: string;
  children?: ElkNode[];
  edges?: ElkExtendedEdge[];
}

export interface Node extends ElkNode {
  id: string;
  height?: number;
  width?: number;
  data?: NodeData;
  fullView?: boolean;
}

export interface ElkPoint {
  x: number;
  y: number;
}

export interface ElkGraphElement {
  id?: string;
  labels?: ElkLabel[];
  layoutOptions?: { [key: string]: string };
}

export interface ElkEdge extends ElkGraphElement {
  id: string;
  junctionPoints?: ElkPoint[];
}

export interface ElkEdgeSection extends ElkGraphElement {
  id: string;
  startPoint: ElkPoint;
  endPoint: ElkPoint;
  bendPoints?: ElkPoint[];
  incomingShape?: string;
  outgoingShape?: string;
  incomingSections?: string[];
  outgoingSections?: string[];
}

export interface ElkLabel extends ElkShape {
  text?: string;
}

export interface ElkPrimitiveEdge extends ElkEdge {
  source: string;
  sourcePort?: string;
  target: string;
  targetPort?: string;
  sourcePoint?: ElkPoint;
  targetPoint?: ElkPoint;
  bendPoints?: ElkPoint[];
}

export interface ElkExtendedEdge extends ElkEdge {
  sources: string[];
  targets: string[];
  sections?: ElkEdgeSection[];
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
