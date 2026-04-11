import type { HierarchyPointNode } from 'd3-hierarchy';
import type { GroupedDataEntityLineageNode } from './dataentityLineage';

export interface Point {
  x: number;
  y: number;
}

export interface TreeNodeDatum extends GroupedDataEntityLineageNode {
  children?: TreeNodeDatum[];
  d3attrs: { id: string };
}

export interface TreeLinkDatum {
  source: HierarchyPointNode<TreeNodeDatum>;
  target: HierarchyPointNode<TreeNodeDatum>;
  isHighlighted?: boolean;
}
