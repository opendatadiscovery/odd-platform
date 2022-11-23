import React from 'react';
import { nodeSizeInitial } from '../constants';
import { type NodeSize } from '../interfaces';

export interface LineageContextProps {
  compact: boolean;
  nodeSize: NodeSize;
  setCompactView: (isCompact: boolean) => void;
}

const defaultBehaviour: LineageContextProps = {
  compact: false,
  nodeSize: nodeSizeInitial,
  setCompactView: () => {},
};

const LineageContext = React.createContext<LineageContextProps>(defaultBehaviour);

export default LineageContext;
