import type {
  DataEntityLineageEdge,
  DataEntityLineageNode,
  DataEntityLineage,
} from 'generated-sources';
import type { DataEntityLineageState } from 'redux/interfaces';

export interface DataEntityLineageById<
  NodeT = GroupedDataEntityLineageNode,
  EdgeT = DataEntityLineageEdge
> {
  rootNode: NodeT;
  upstream: DataEntityLineageStreamById<NodeT, EdgeT>;
  downstream: DataEntityLineageStreamById<NodeT, EdgeT>;
}

export interface DataEntityLineageStreamById<
  NodeT = GroupedDataEntityLineageNode,
  EdgeT = DataEntityLineageEdge
> {
  nodesById: { [nodeId: number]: NodeT };
  // Id of parent entity in the tree. It is source_id of DataEntityLineageEdge for downstream, and target_id for upstream
  edgesById: { [entityId: number]: EdgeT[] };
  crossEdges: EdgeT[];
}

export interface DataEntityLineageRequestParams {
  rootNodeId: number;
  expandGroups: boolean;
}

export interface DataEntityLineageResponse {
  rootNodeId: number;
  dataEntityId: number;
  dataEntityLineage: DataEntityLineage;
  expandGroups?: boolean;
}

export interface GroupedDataEntityLineageNode extends DataEntityLineageNode {
  nodesRelatedWithDEG?: DataEntityLineageNode[];
  originalGroupId?: number;
}

export interface LocalLineageState {
  allNodes: Array<DataEntityLineageNode | GroupedDataEntityLineageNode>;
  nodeIds: Set<number>;
  allEdges: DataEntityLineageEdge[];
  allGroups: DataEntityLineageNode[];
  groupIds: Set<number>;
  excludedIds: Set<number>;
  idsToExclude: Set<number>;
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

export interface GroupNodesAndFilterEdgesParams {
  rootNodeId: number;
  localLineageState: LocalLineageState;
  minGroupSize: number;
}

export interface GroupedNodesAndFilteredEdges {
  nodes: GroupedDataEntityLineageNode[];
  edges: DataEntityLineageEdge[];
  crossEdges: DataEntityLineageEdge[];
}

export interface ParseLineageParams {
  state: DataEntityLineageState;
  rootNodeId: number;
  rootNode?: DataEntityLineageNode;
  edges: DataEntityLineageEdge[];
  nodes: DataEntityLineageNode[];
  crossEdges: DataEntityLineageEdge[];
  dataEntityLineageInitialState: DataEntityLineageStreamById;
}

export interface ExpandEntitiesFromGroupParams {
  payload: { rootNodeId: number; idsToExclude: number[] };
}

export interface ExpandAllGroupsParams {
  payload: { rootNodeId: number; isExpanded: boolean };
}
