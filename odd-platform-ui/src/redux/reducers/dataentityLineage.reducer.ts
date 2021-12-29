import { Action } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import {
  DataEntityLineage,
  DataEntityLineageEdge,
  DataEntityLineageNode,
} from 'generated-sources';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import { DataEntityLineageState } from '../interfaces';
import {
  DataEntityLineageStreamById,
  FilterEdges,
  GroupedDataEntityLineageNode,
  GroupingNodes,
  LocalState,
} from '../interfaces/dataentityLineage';

const localState: LocalState = {
  allNodes: [],
  nodeIds: new Set<number>(),
  allEdges: [],
  allGroups: [],
  groupIds: new Set<number>(),
  excludedIds: new Set<number>(),
};

export const initialState: DataEntityLineageState = {};
export const dataEntityLineageInitialState = {
  edgesById: {},
  nodesById: {},
};

enum DataEntityLineageStreamTypeEnum {
  UPSTREAM = 'upstream',
  DOWNSTREAM = 'downstream',
}

const startId = 2 ** 30;
let increment = 0;

// eslint-disable-next-line no-plusplus
const generateNumberId = () => startId + increment++;

const setDataByType = (
  type: DataEntityLineageStreamTypeEnum,
  firstData: any,
  secondData: any
) => (type === 'downstream' ? firstData : secondData);

const groupingNodes = (
  groupIdsBySourceId: Map<number, number[]>,
  sourceIdByDepth: Map<number, number[]>,
  minGroupSize: number,
  keepInBiggestGroup: boolean,
  excludedIds: Set<number>
): GroupingNodes[] => {
  const groupedNodes: GroupingNodes[] = [];
  Array.from(sourceIdByDepth.keys()).forEach(depth => {
    const sourceIds = sourceIdByDepth
      .get(depth)
      ?.filter(s => !excludedIds.has(s));
    // groupId -> sourceId[]
    const depthGroups = sourceIds!.reduce((map, sourceId) => {
      const groupIds = groupIdsBySourceId.get(sourceId);
      if (groupIds !== undefined) {
        groupIds.forEach(groupId => {
          if (!map.has(groupId)) {
            map.set(groupId, [sourceId]);
          } else {
            map.get(groupId)?.push(sourceId);
          }
        });
      }
      return map;
    }, new Map<number, number[]>());

    const sourceIdsByGroupId = new Map<number, number[]>();

    Array.from(groupIdsBySourceId.keys())
      .filter(s => sourceIds?.includes(s))
      .forEach(s => sourceIdsByGroupId.set(s, groupIdsBySourceId.get(s)!));

    const resultSourceIdsByGroupId = new Map<number, number[]>();
    const generatedGroupIdByGroupId = new Map<number, number>();

    Array.from(sourceIdsByGroupId.keys()).forEach(sourceId => {
      const groupIds = sourceIdsByGroupId.get(sourceId);
      if (groupIds !== undefined && groupIds.length >= 1) {
        const maxGroup = groupIds.reduce(
          ({ groupId, size }, currentGroupId) => {
            const groupSize = depthGroups.get(currentGroupId)?.length;
            if (groupSize && groupSize > size && keepInBiggestGroup) {
              return { groupId: currentGroupId, size: groupSize };
            }
            if (groupSize && groupSize < size && !keepInBiggestGroup) {
              return { groupId: currentGroupId, size: groupSize };
            }
            return { groupId, size };
          },
          { groupId: 0, size: 0 }
        );

        // fill resultSourceIdsByGroupId Map with maxGroup.groupIds -> array of source ids
        if (!resultSourceIdsByGroupId.has(maxGroup.groupId)) {
          resultSourceIdsByGroupId.set(maxGroup.groupId, [sourceId]);
        } else {
          resultSourceIdsByGroupId.get(maxGroup.groupId)?.push(sourceId);
        }
      }
    });

    // fill generatedGroupIdByGroupId Map with groupId -> generated groupId
    Array.from(resultSourceIdsByGroupId.keys()).forEach(groupId =>
      generatedGroupIdByGroupId.set(groupId, generateNumberId())
    );

    Array.from(resultSourceIdsByGroupId.keys()).forEach(groupId =>
      groupedNodes.push({
        groupId,
        depthGroupId: generatedGroupIdByGroupId.get(groupId)!,
        depth,
        sourceIds: resultSourceIdsByGroupId.get(groupId)!,
      })
    );
  });

  return groupedNodes;
};

const filterEdges = (
  rootNodeId: number,
  edges: DataEntityLineageEdge[],
  lineageType: DataEntityLineageStreamTypeEnum,
  sourceIdMapByDepth: Map<number, number[]>
): FilterEdges => {
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

  type Queue = Array<{ sourceId: number; depth: number }>;

  const queue: Queue = [{ sourceId: rootNodeId, depth: 0 }];
  const filteredEdges = new Array<DataEntityLineageEdge>();
  const crossEdges = new Array<DataEntityLineageEdge>();
  const allAddedIds = new Set<number>([rootNodeId]);

  const edgesMap = edges.reduce((map, edge) => {
    if (!map.has(edge[edgeType])) {
      return map.set(edge[edgeType], [edge[oppositeEdgeType]]);
    }
    map.get(edge[edgeType])?.push(edge[oppositeEdgeType]);
    return map;
  }, new Map<number, number[]>());

  while (queue.length > 0) {
    const { sourceId, depth } = queue.shift()!;

    const lineageDepth = depth + 1;

    const targetIds = edgesMap.get(sourceId);

    if (
      targetIds !== undefined &&
      targetIds !== null &&
      targetIds.length > 0
    ) {
      const nonAddedIds = targetIds.filter(id => !allAddedIds.has(id));

      filteredEdges.push(
        ...nonAddedIds.map(id =>
          lineageType === 'downstream'
            ? {
                sourceId,
                targetId: id,
              }
            : {
                sourceId: id,
                targetId: sourceId,
              }
        )
      );
      const addedIds = targetIds.filter(id => allAddedIds.has(id));
      crossEdges.push(
        ...addedIds.map(id =>
          lineageType === 'downstream'
            ? {
                sourceId,
                targetId: id,
              }
            : {
                sourceId: id,
                targetId: sourceId,
              }
        )
      );

      nonAddedIds.forEach(id => allAddedIds.add(id));

      if (!sourceIdMapByDepth.has(lineageDepth)) {
        sourceIdMapByDepth.set(lineageDepth, []);
      }

      const depthSourceIds: number[] = sourceIdMapByDepth.get(
        lineageDepth
      )!;

      depthSourceIds.push(...nonAddedIds);

      nonAddedIds.forEach(id =>
        queue.push({ sourceId: id, depth: lineageDepth })
      );
    }
  }
  return { filteredEdges, sourceIdMapByDepth, crossEdges };
};

const updateDataEntityLineage = (
  state: DataEntityLineageState,
  entityId: number,
  lineage: DataEntityLineage,
  rootNodeId: number,
  lineageType: DataEntityLineageStreamTypeEnum
): DataEntityLineageState => {
  lineage[lineageType].nodes.forEach(node => {
    if (!localState.nodeIds.has(node.id)) {
      localState.allNodes.push(node);
      localState.nodeIds.add(node.id);
    }
  });

  localState.allEdges.push(...lineage[lineageType].edges);

  lineage[lineageType].groups.forEach(group => {
    if (!localState.groupIds.has(group.id)) {
      localState.allGroups.push(group);
      localState.groupIds.add(group.id);
    }
  });

  localState.excludedIds.add(lineage.root.id);

  const oppositeType: DataEntityLineageStreamTypeEnum = setDataByType(
    lineageType,
    DataEntityLineageStreamTypeEnum.UPSTREAM,
    DataEntityLineageStreamTypeEnum.DOWNSTREAM
  );

  const getStreamDataFromState = (type: DataEntityLineageStreamTypeEnum) =>
    rootNodeId !== entityId
      ? state[rootNodeId]?.[type]
      : state[entityId]?.[type] || dataEntityLineageInitialState;

  const setRootNode = (rootNode: DataEntityLineageNode) =>
    rootNodeId !== entityId ? state[rootNodeId].root : rootNode;

  const edgeType: keyof DataEntityLineageEdge = setDataByType(
    lineageType,
    'sourceId',
    'targetId'
  );

  const createStreamData = (): DataEntityLineageStreamById => {
    const sourceIdMapByDepth = new Map<number, number[]>();
    const groupIdsBySourceId = Array.from(localState.allNodes).reduce(
      (map, node) => {
        if (node.groupId && !map.has(node.id)) {
          map.set(node.id, [node.groupId]);
        } else if (node.groupId) {
          map.get(node.id)?.push(node.groupId);
        }
        return map;
      },
      new Map<number, number[]>()
    );

    const { filteredEdges, crossEdges } = filterEdges(
      rootNodeId,
      Array.from(localState.allEdges),
      lineageType,
      sourceIdMapByDepth
    );

    const groupedNodes = groupingNodes(
      groupIdsBySourceId,
      sourceIdMapByDepth,
      2,
      true,
      localState.excludedIds
    );

    const depthGroupIdBySourceId = new Map<number, number>();
    groupedNodes.forEach(node => {
      node.sourceIds.forEach(sourceId =>
        depthGroupIdBySourceId.set(sourceId, node.depthGroupId)
      );
    });

    const replacedEdges = filteredEdges.map(edge => ({
      sourceId: depthGroupIdBySourceId.has(edge.sourceId)
        ? depthGroupIdBySourceId.get(edge.sourceId)!
        : edge.sourceId,
      targetId: depthGroupIdBySourceId.has(edge.targetId)
        ? depthGroupIdBySourceId.get(edge.targetId)!
        : edge.targetId,
    }));

    const replacedCrossEdges = crossEdges.map(edge => ({
      sourceId: depthGroupIdBySourceId.has(edge.sourceId)
        ? depthGroupIdBySourceId.get(edge.sourceId)!
        : edge.sourceId,
      targetId: depthGroupIdBySourceId.has(edge.targetId)
        ? depthGroupIdBySourceId.get(edge.targetId)!
        : edge.targetId,
    }));

    const resultCrossEdges: DataEntityLineageEdge[] = uniqWith(
      replacedCrossEdges,
      isEqual
    );

    const resultEdges: DataEntityLineageEdge[] = uniqWith(
      replacedEdges,
      isEqual
    );

    const resultNodes: GroupedDataEntityLineageNode[] = groupedNodes
      .map(groupNode => {
        const group = localState.allGroups.find(
          g => g.id === groupNode.groupId
        );
        const resultNode: GroupedDataEntityLineageNode = {
          ...group,
          id: groupNode.depthGroupId,
          nodesRelatedWithDEG: localState.allNodes.filter(n =>
            groupNode.sourceIds.includes(n.id)
          ),
          originalGroupId: group?.id,
        };
        return resultNode;
      })
      .concat(localState.allNodes);

    return {
      edgesById: resultEdges.reduce<
        DataEntityLineageStreamById['edgesById']
      >(
        (memo, edge) => ({
          ...memo,
          [edge[edgeType]]: memo[edge[edgeType]]
            ? [...memo[edge[edgeType]], edge]
            : [edge],
        }),
        {}
      ),
      nodesById: resultNodes.reduce<
        DataEntityLineageStreamById['nodesById']
      >(
        (memo, node) => ({
          ...memo,
          [node.id]: node,
        }),
        {}
      ),
    };
  };

  return {
    ...state,
    [rootNodeId || entityId]: {
      downstream: setDataByType(
        lineageType,
        createStreamData(),
        getStreamDataFromState(oppositeType)
      ),
      root: setRootNode(lineage.root),
      upstream: setDataByType(
        lineageType,
        getStreamDataFromState(oppositeType),
        createStreamData()
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
