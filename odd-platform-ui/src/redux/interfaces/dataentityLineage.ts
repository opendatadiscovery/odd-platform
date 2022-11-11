import type { DataEntityLineageEdge, DataEntityLineageNode } from 'generated-sources';

export interface DataEntityLineageById<
  NodeT = DataEntityLineageNode,
  EdgeT = DataEntityLineageEdge
> {
  rootNode: NodeT;
  upstream: DataEntityLineageStreamById<NodeT, EdgeT>;
  downstream: DataEntityLineageStreamById<NodeT, EdgeT>;
}

export interface DataEntityLineageStreamById<
  NodeT = DataEntityLineageNode,
  EdgeT = DataEntityLineageEdge
> {
  nodesById: { [nodeId: number]: NodeT };
  // Id of parent entity in the tree. It is source_id of DataEntityLineageEdge for downstream, and target_id for upstream
  edgesById: { [entityId: number]: EdgeT[] };
  crossEdges: EdgeT[];
}

export interface DataEntityLineageRootNodeId {
  rootNodeId: number;
}

export interface GroupedDataEntityLineageNode extends DataEntityLineageNode {
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

export interface GroupingUpstreamNodes {
  groupId: number;
  depthGroupId: number;
  depth: number;
  sourceIds: number[];
}

export interface GroupingDownstreamNodes {
  groupId: number;
  depthGroupId: number;
  depth: number;
  targetIds: number[];
}

export interface FilterDownstreamEdges {
  filteredEdges: DataEntityLineageEdge[];
  targetIdsMapByDepth: Map<number, number[]>;
  crossEdges: DataEntityLineageEdge[];
}

export interface FilterUpstreamEdges {
  filteredEdges: DataEntityLineageEdge[];
  sourceIdsMapByDepth: Map<number, number[]>;
  crossEdges: DataEntityLineageEdge[];
}

export type StreamType = 'downstream' | 'upstream';
