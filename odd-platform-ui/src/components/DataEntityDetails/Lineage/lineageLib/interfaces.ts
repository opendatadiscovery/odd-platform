import React from 'react';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy';
import { TreeLinkDatum, TreeNodeDatum } from 'redux/interfaces';
import { DataEntityLineageEdge } from 'generated-sources';
import { defaultGraphState } from 'components/DataEntityDetails/Lineage/lineageLib/constants';

export interface Zoom extends ProvidedZoom<SVGSVGElement> {
  transformMatrix: TransformMatrix;
  isDragging: boolean;
}

export interface Separation {
  siblings: number;
  nonSiblings: number;
}

export interface NodeSize {
  x: number;
  y: number;
  mx: number;
  my: number;
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
