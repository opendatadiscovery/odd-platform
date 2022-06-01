import { DataEntityLineageState } from 'redux/interfaces';
import { DataEntityLineageNode } from 'generated-sources';

export const setRootNode = (
  state: DataEntityLineageState,
  rootNodeId: number,
  currentRootNodeId: number,
  rootNode: DataEntityLineageNode
) =>
  rootNodeId === currentRootNodeId ? rootNode : state[rootNodeId].rootNode;
