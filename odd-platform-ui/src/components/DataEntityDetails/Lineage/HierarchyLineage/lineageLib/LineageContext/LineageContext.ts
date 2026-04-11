import React from 'react';
import type { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy';
import { type TreeNodeDatum } from 'redux/interfaces';
import { nodeSizeInitial } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/constants';
import { type NodeSize } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/interfaces';

export interface LineageContextProps {
  nodeSize: NodeSize;
  setRenderedNodes: (nodes: HierarchyPointNode<TreeNodeDatum>[]) => void;
  highLightedLinks: HierarchyPointLink<TreeNodeDatum>[];
  setHighLightedLinks: (links: HierarchyPointLink<TreeNodeDatum>[]) => void;
  renderedLinks: HierarchyPointLink<TreeNodeDatum>[];
  setRenderedLinks: (links: HierarchyPointLink<TreeNodeDatum>[]) => void;
}

const defaultBehaviour: LineageContextProps = {
  nodeSize: nodeSizeInitial,
  setRenderedNodes: () => {},
  renderedLinks: [],
  setRenderedLinks: () => {},
  highLightedLinks: [],
  setHighLightedLinks: () => {},
};

const LineageContext = React.createContext<LineageContextProps>(defaultBehaviour);

export default LineageContext;
