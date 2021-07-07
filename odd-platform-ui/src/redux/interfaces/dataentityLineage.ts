import {
  DataEntityLineageNode,
  DataEntityLineageEdge,
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
