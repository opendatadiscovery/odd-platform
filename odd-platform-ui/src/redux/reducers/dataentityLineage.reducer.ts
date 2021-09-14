import { Action } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import {
  DataEntityLineage,
  DataEntityLineageEdge,
  DataEntityLineageNode,
  DataEntityLineageStream,
} from 'generated-sources';
import { DataEntityLineageState } from '../interfaces';
import { DataEntityLineageStreamById } from '../interfaces/dataentityLineage';

export const initialState: DataEntityLineageState = {};
export const dataEntityLineageInitialState = {
  edgesById: {},
  nodesById: {},
};

enum DataEntityLineageStreamTypeEnum {
  UPSTREAM = 'upstream',
  DOWNSTREAM = 'downstream',
}

const updateDataEntityLineage = (
  state: DataEntityLineageState,
  entityId: number,
  lineage: DataEntityLineage,
  rootNodeId: number | undefined,
  lineageType: DataEntityLineageStreamTypeEnum
) => {
  const setDataByType = (
    type: DataEntityLineageStreamTypeEnum,
    firstData: any,
    secondData: any
  ) => (type === 'downstream' ? firstData : secondData);

  const oppositeType: DataEntityLineageStreamTypeEnum = setDataByType(
    lineageType,
    DataEntityLineageStreamTypeEnum.UPSTREAM,
    DataEntityLineageStreamTypeEnum.DOWNSTREAM
  );

  const getStreamDataFromState = (type: DataEntityLineageStreamTypeEnum) =>
    rootNodeId
      ? state[rootNodeId]?.[type]
      : state[entityId]?.[type] || dataEntityLineageInitialState;

  const setRootNode = (rootNode: DataEntityLineageNode) =>
    rootNodeId ? state[rootNodeId].root : rootNode;

  const createStreamData = (data: DataEntityLineageStream) => {
    const edgeType: keyof DataEntityLineageEdge = setDataByType(
      lineageType,
      'sourceId',
      'targetId'
    );

    return {
      edgesById: data.edges
        ? data.edges.reduce<DataEntityLineageStreamById['edgesById']>(
            (memo, edge) => ({
              ...memo,
              [edge[edgeType]]: memo[edge[edgeType]]
                ? [...memo[edge[edgeType]], edge]
                : [edge],
            }),
            rootNodeId
              ? { ...state[rootNodeId][lineageType].edgesById }
              : {}
          )
        : {},
      nodesById: data.nodes
        ? data.nodes.reduce<DataEntityLineageStreamById['nodesById']>(
            (memo, node) => ({
              ...memo,
              [node.id]: node,
            }),
            rootNodeId
              ? { ...state[rootNodeId][lineageType].nodesById }
              : {}
          )
        : {},
    };
  };

  return {
    ...state,
    [rootNodeId || entityId]: {
      downstream: setDataByType(
        lineageType,
        createStreamData(lineage[lineageType]),
        getStreamDataFromState(oppositeType)
      ),
      root: setRootNode(lineage.root),
      upstream: setDataByType(
        lineageType,
        getStreamDataFromState(oppositeType),
        createStreamData(lineage[lineageType])
      ),
    },
  };
};

const reducer = (
  state = initialState,
  action: Action
): DataEntityLineageState => {
  switch (action.type) {
    case getType(actions.fetchDataEntityDownstreamLineageAction.success):
      return updateDataEntityLineage(
        state,
        action.payload.entityId,
        action.payload.value.dataEntityLineage,
        action.payload.value.rootNodeId,
        DataEntityLineageStreamTypeEnum.DOWNSTREAM
      );
    case getType(actions.fetchDataEntityUpstreamLineageAction.success):
      return updateDataEntityLineage(
        state,
        action.payload.entityId,
        action.payload.value.dataEntityLineage,
        action.payload.value.rootNodeId,
        DataEntityLineageStreamTypeEnum.UPSTREAM
      );
    default:
      return state;
  }
};

export default reducer;
