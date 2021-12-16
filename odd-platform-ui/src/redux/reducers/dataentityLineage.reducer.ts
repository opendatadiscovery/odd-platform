import { Action } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import {
  DataEntityLineage,
  DataEntityLineageEdge,
  DataEntityLineageNode,
  DataEntityLineageStream,
} from 'generated-sources';
import isEmpty from 'lodash/isEmpty';
import { notEmpty } from 'lib/helpers';
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

const setDataByType = (
  type: DataEntityLineageStreamTypeEnum,
  firstData: any,
  secondData: any
) => (type === 'downstream' ? firstData : secondData);

const filteringOfNeighborsEdges = (edges: DataEntityLineageEdge[]) => {
  const filteredEdges: DataEntityLineageEdge[] = edges
    .map(edge => {
      const isEdgeCyclical = !!edges.find(
        el =>
          el.sourceId === edge.targetId && el.targetId === edge.sourceId
      );
      // const updatedEdge = { ...edge, isEdgeCyclical };
      return isEdgeCyclical && edge.sourceId > edge.targetId
        ? undefined
        : edge;
    })
    .filter(notEmpty);

  return filteredEdges;
};

const filteringOfDistantEdges = (
  entityId: number,
  rootNodeId: number | undefined,
  edges: DataEntityLineageEdge[] | undefined,
  lineageType: DataEntityLineageStreamTypeEnum
) => {
  const edgeType: keyof DataEntityLineageEdge = setDataByType(
    lineageType,
    'sourceId',
    'targetId'
  );

  const oppositeEdgeType: keyof DataEntityLineageEdge = setDataByType(
    lineageType,
    'targetId',
    'sourceId'
  );

  const edgesMap = new Map<number, number[]>();
  const queue: number[] = [rootNodeId || entityId];
  const filteredDistantEdges = new Array<DataEntityLineageEdge>();
  const allAddedIds = new Set<number>();

  edges?.reduce((map, edge) => {
    if (!map.has(edge[edgeType])) {
      return map.set(edge[edgeType], [edge[oppositeEdgeType]]);
    }
    map.get(edge[edgeType])?.push(edge[oppositeEdgeType]);
    return map;
  }, edgesMap);

  while (!isEmpty(queue)) {
    const source = queue.shift()!;

    const levelIds = edgesMap.get(source);

    if (
      Array.isArray(levelIds) &&
      levelIds !== null &&
      !isEmpty(levelIds)
    ) {
      const nonAddedIds = levelIds.filter(id => !allAddedIds.has(id));

      filteredDistantEdges.push(
        ...nonAddedIds.map(id =>
          lineageType === 'downstream'
            ? {
                sourceId: source,
                targetId: id,
              }
            : {
                sourceId: id,
                targetId: source,
              }
        )
      );

      nonAddedIds.forEach(id => allAddedIds.add(id));

      queue.push(...nonAddedIds);
    }
  }

  return filteredDistantEdges;
};

const updateDataEntityLineage = (
  state: DataEntityLineageState,
  entityId: number,
  lineage: DataEntityLineage,
  rootNodeId: number | undefined,
  lineageType: DataEntityLineageStreamTypeEnum
) => {
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

    const { edges } = data;
    const filteredDistantEdges = filteringOfDistantEdges(
      entityId,
      rootNodeId,
      edges,
      lineageType
    );
    const filteredEdges = filteringOfNeighborsEdges(filteredDistantEdges);

    return {
      edgesById: filteredEdges.reduce<
        DataEntityLineageStreamById['edgesById']
      >(
        (memo, edge) => ({
          ...memo,
          [edge[edgeType]]: memo[edge[edgeType]]
            ? [...memo[edge[edgeType]], edge]
            : [edge],
        }),
        rootNodeId ? { ...state[rootNodeId][lineageType].edgesById } : {}
      ),
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
