import type { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import type { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy';
import type { TreeLinkDatum, TreeNodeDatum } from 'redux/interfaces';
import type { DataEntityLineageEdge } from 'generated-sources';

export interface Zoom extends ProvidedZoom<SVGSVGElement> {
  transformMatrix: TransformMatrix;
  isDragging: boolean;
}

export interface Separation {
  siblings: number;
  nonSiblings: number;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export interface NodeSize {
  size: Size & { mx: number; my: number; contentWidth: number };
  content: NodeContentLayout;
}

export interface NodeContentLayout {
  title: Position & Pick<Size, 'width'>;
  hiddenDeps: Position;
  info: Position & { lineHeight: number; labelWidth: number; contentWidth: number };
  classes: Position & Size & { mx: number };
  loadMore: { layer: Position & Size; button: Position & Size };
}

export interface LineageGraphState {
  nodesUp: HierarchyPointNode<TreeNodeDatum>[];
  linksUp: TreeLinkDatum[];
  crossLinksUp: HierarchyPointLink<TreeNodeDatum>[];
  replacedCrossLinksUp: TreeLinkDatum[];
  nodesDown: HierarchyPointNode<TreeNodeDatum>[];
  linksDown: HierarchyPointLink<TreeNodeDatum>[];
  crossLinksDown: HierarchyPointLink<TreeNodeDatum>[];
  replacedCrossLinksDown: TreeLinkDatum[];
  depth: { upstream: number; downstream: number };
}

export interface GenerateGraphProps {
  parsedData: LineageParsedData | undefined;
  defaultGraphState: LineageGraphState;
  separation: Separation;
  nodeSize: NodeSize;
}

export interface LineageParsedData {
  root: TreeNodeDatum;
  upstream: {
    nodesById: { [nodeId: number]: TreeNodeDatum };
    edgesById: { [entityId: number]: DataEntityLineageEdge[] };
    crossEdges: DataEntityLineageEdge[];
  };
  downstream: {
    nodesById: { [nodeId: number]: TreeNodeDatum };
    edgesById: { [entityId: number]: DataEntityLineageEdge[] };
    crossEdges: DataEntityLineageEdge[];
  };
}
