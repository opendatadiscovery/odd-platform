import { DataEntityLineageNode } from 'generated-sources';
import { HierarchyPointNode } from 'd3-hierarchy';

export interface Point {
  x: number;
  y: number;
}

export interface TreeNodeDatum extends DataEntityLineageNode {
  children?: TreeNodeDatum[];
  d3attrs: {
    id: string;
    // depth: number;
    // collapsed: boolean;
  };
}

export interface TreeLinkDatum {
  source: HierarchyPointNode<TreeNodeDatum>;
  target: HierarchyPointNode<TreeNodeDatum>;
}
