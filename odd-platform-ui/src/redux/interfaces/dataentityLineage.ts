import {
  DataEntityLineageNode,
  DataEntityLineageEdge,
  DataEntityLineage,
} from 'generated-sources';

export interface DataEntityLineageById<
  NodeT = DataEntityLineageNode,
  EdgeT = DataEntityLineageEdge
> {
  root: NodeT;
  upstream: DataEntityLineageStreamById<NodeT, EdgeT>;
  downstream: DataEntityLineageStreamById<NodeT, EdgeT>;
}

export interface DataEntityLineageStreamById<
  NodeT = DataEntityLineageNode,
  EdgeT = DataEntityLineageEdge
> {
  nodesById: {
    [nodeId: number]: NodeT;
  };
  edgesById: {
    // Id of parent entity in the tree. It is source_id of DataEntityLineageEdge for downstream, and target_id for upstream
    [entityId: number]: EdgeT[];
  };
}

export interface DataEntityLineageRootNodeId {
  rootNodeId: number;
}

export interface LineageStreamParams {
  dataEntityLineage: DataEntityLineage;
  rootNodeId: number;
}

export interface GroupedDataEntityLineageNode
  extends DataEntityLineageNode {
  nodesRelatedWithDEG?: DataEntityLineageNode[];
  originalGroupId?: number;
}

export interface LocalState {
  allNodes: Array<DataEntityLineageNode | GroupedDataEntityLineageNode>;
  nodeIds: Set<number>;
  allEdges: DataEntityLineageEdge[];
  allGroups: DataEntityLineageNode[];
  groupIds: Set<number>;
  excludedIds: Set<number>;
}

export interface GroupingNodes {
  groupId: number;
  depthGroupId: number;
  depth: number;
  sourceIds: number[];
}

export interface FilterEdges {
  filteredEdges: DataEntityLineageEdge[];
  sourceIdMapByDepth: Map<number, number[]>;
  crossEdges: DataEntityLineageEdge[];
}
