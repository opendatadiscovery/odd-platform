import React from 'react';
import { type HierarchyPointNode } from 'd3-hierarchy';
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
}

const defaultBehaviour: LineageContextProps = {
  nodeSize: nodeSizeInitial,
  compact: false,
  setCompactView: () => {},
  fullTitles: false,
  setFullTitlesView: () => {},
  setRenderedNodes: () => {},
};

const LineageContext = React.createContext<LineageContextProps>(defaultBehaviour);

export default LineageContext;
