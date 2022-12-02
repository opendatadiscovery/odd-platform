import React from 'react';
import type { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy';
import { type TreeNodeDatum } from 'redux/interfaces';
import { nodeSizeInitial } from '../constants';
import { type NodeSize } from '../interfaces';

export interface LineageContextProps {
  nodeSize: NodeSize;
  compact: boolean;
  setCompactView: (isCompact: boolean) => void;
  fullTitles: boolean;
  setFullTitlesView: (isTitlesFull: boolean) => void;
  setRenderedNodes: (nodes: HierarchyPointNode<TreeNodeDatum>[]) => void;
  highLightedLinks: HierarchyPointLink<TreeNodeDatum>[];
  setHighLightedLinks: (links: HierarchyPointLink<TreeNodeDatum>[]) => void;
  renderedLinks: HierarchyPointLink<TreeNodeDatum>[];
  setRenderedLinks: (links: HierarchyPointLink<TreeNodeDatum>[]) => void;
}

const defaultBehaviour: LineageContextProps = {
  nodeSize: nodeSizeInitial,
  compact: false,
  setCompactView: () => {},
  fullTitles: false,
  setFullTitlesView: () => {},
  setRenderedNodes: () => {},
  renderedLinks: [],
  setRenderedLinks: () => {},
  highLightedLinks: [],
  setHighLightedLinks: () => {},
};

const LineageContext = React.createContext<LineageContextProps>(defaultBehaviour);

export default LineageContext;
