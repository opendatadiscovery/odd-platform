import type {
  DataEntityLineageById,
  DataEntityLineageState,
  DataEntityLineageStreamById,
  FilterDownstreamEdges,
  FilterUpstreamEdges,
  GroupedDataEntityLineageNode,
  GroupedNodesAndFilteredEdges,
  GroupingDownstreamNodes,
  GroupingUpstreamNodes,
  GroupNodesAndFilterEdgesParams,
  LocalLineageState,
  ParseLineageParams,
  StreamType,
} from 'redux/interfaces';
import type { DataEntityLineageEdge, DataEntityLineageNode } from 'generated-sources';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';

export const isRootNodeIdsEqual = (rootNodeId: number, currentRootNodeId: number) =>
  rootNodeId === currentRootNodeId;

export const setRootNode = (
  state: DataEntityLineageState,
  rootNodeId: number,
  currentRootNodeId: number,
  rootNode: DataEntityLineageNode
) =>
  isRootNodeIdsEqual(rootNodeId, currentRootNodeId)
    ? rootNode
    : state[rootNodeId].rootNode;

export const resetLocalState = (localState: LocalLineageState) => {
  localState.allNodes = [];
  localState.nodeIds = new Set();
  localState.allEdges = [];
  localState.allGroups = [];
  localState.groupIds = new Set();
  localState.excludedIds = new Set();
};

type UpstreamQueue = Array<{ targetId: number; depth: number }>;
type DownstreamQueue = Array<{ sourceId: number; depth: number }>;

interface DownstreamFilteringStructure {
  downstreamQueue: DownstreamQueue;
  targetIdsMapByDepth: Map<number, number[]>;
  allAddedIds: Set<number>;
  filteredEdges: Array<DataEntityLineageEdge>;
  crossEdges: Array<DataEntityLineageEdge>;
}

interface UpstreamFilteringStructure {
  upstreamQueue: UpstreamQueue;
  sourceIdsMapByDepth: Map<number, number[]>;
  allAddedIds: Set<number>;
  filteredEdges: Array<DataEntityLineageEdge>;
  crossEdges: Array<DataEntityLineageEdge>;
}

const getDefaultFilteringStructures = (rootNodeId: number, type: StreamType) => {
  const upstreamQueue: UpstreamQueue = [{ targetId: rootNodeId, depth: 0 }];
  const downstreamQueue: DownstreamQueue = [{ sourceId: rootNodeId, depth: 0 }];
  const targetIdsMapByDepth = new Map<number, number[]>();
  const sourceIdsMapByDepth = new Map<number, number[]>();
  const allAddedIds = new Set<number>([rootNodeId]);

  const filteredEdges = new Array<DataEntityLineageEdge>();
  const crossEdges = new Array<DataEntityLineageEdge>();

  const downstreamResult = {
    downstreamQueue,
    targetIdsMapByDepth,
    allAddedIds,
    filteredEdges,
    crossEdges,
  };

  const upstreamResult = {
    upstreamQueue,
    sourceIdsMapByDepth,
    allAddedIds,
    filteredEdges,
    crossEdges,
  };

  return type === 'downstream' ? downstreamResult : upstreamResult;
};

// filter edges from cycle dependencies and duplicates
export const filterDownstreamEdges = (
  rootNodeId: number,
  edges: DataEntityLineageEdge[]
): FilterDownstreamEdges => {
  const {
    downstreamQueue: queue,
    targetIdsMapByDepth,
    allAddedIds,
    crossEdges,
    filteredEdges,
  } = getDefaultFilteringStructures(
    rootNodeId,
    'downstream'
  ) as DownstreamFilteringStructure;

  const edgesMap = edges.reduce((map, edge) => {
    if (!map.has(edge.sourceId)) {
      return map.set(edge.sourceId, [edge.targetId]);
    }
    map.get(edge.sourceId)?.push(edge.targetId);
    return map;
  }, new Map<number, number[]>());

  while (queue.length > 0) {
    const queueElement = queue.shift();

    if (queueElement) {
      const { sourceId, depth } = queueElement;

      const lineageDepth = depth + 1;

      const targetIds = edgesMap.get(sourceId);

      if (targetIds !== undefined && targetIds !== null && targetIds.length > 0) {
        const nonAddedIds = targetIds.filter(id => !allAddedIds.has(id));

        filteredEdges.push(...nonAddedIds.map(id => ({ sourceId, targetId: id })));

        const addedIds = targetIds.filter(id => allAddedIds.has(id));

        crossEdges.push(...addedIds.map(id => ({ sourceId, targetId: id })));

        nonAddedIds.forEach(id => allAddedIds.add(id));

        if (!targetIdsMapByDepth.has(lineageDepth)) {
          targetIdsMapByDepth.set(lineageDepth, []);
        }

        const depthTargetIds = targetIdsMapByDepth.get(lineageDepth);

        if (depthTargetIds) {
          depthTargetIds.push(...nonAddedIds);
        }

        nonAddedIds.forEach(id => queue.push({ sourceId: id, depth: lineageDepth }));
      }
    }
  }

  return { filteredEdges, crossEdges, targetIdsMapByDepth };
};

// filter edges from cycle dependencies and duplicates
export const filterUpstreamEdges = (
  rootNodeId: number,
  edges: DataEntityLineageEdge[]
): FilterUpstreamEdges => {
  const {
    upstreamQueue: queue,
    sourceIdsMapByDepth,
    allAddedIds,
    crossEdges,
    filteredEdges,
  } = getDefaultFilteringStructures(rootNodeId, 'upstream') as UpstreamFilteringStructure;

  const edgesMap = edges.reduce((map, edge) => {
    if (!map.has(edge.targetId)) {
      return map.set(edge.targetId, [edge.sourceId]);
    }
    map.get(edge.targetId)?.push(edge.sourceId);
    return map;
  }, new Map<number, number[]>());

  while (queue.length > 0) {
    const queueElement = queue.shift();

    if (queueElement) {
      const { targetId, depth } = queueElement;

      const lineageDepth = depth + 1;

      const sourceIds = edgesMap.get(targetId);

      if (sourceIds !== undefined && sourceIds !== null && sourceIds.length > 0) {
        const nonAddedIds = sourceIds.filter(id => !allAddedIds.has(id));

        filteredEdges.push(...nonAddedIds.map(id => ({ sourceId: id, targetId })));

        const addedIds = sourceIds.filter(id => allAddedIds.has(id));

        crossEdges.push(...addedIds.map(id => ({ sourceId: id, targetId })));

        nonAddedIds.forEach(id => allAddedIds.add(id));

        if (!sourceIdsMapByDepth.has(lineageDepth)) {
          sourceIdsMapByDepth.set(lineageDepth, []);
        }

        const depthSourceIds = sourceIdsMapByDepth.get(lineageDepth);

        if (depthSourceIds) {
          depthSourceIds.push(...nonAddedIds);
        }

        nonAddedIds.forEach(id => queue.push({ targetId: id, depth: lineageDepth }));
      }
    }
  }

  return { filteredEdges, crossEdges, sourceIdsMapByDepth };
};

// grouping nodes
// function generate map sourceId -> groupIds (for upstream) | targetId -> groupIds (for downstream)
export const generateGroupIdsMap = (
  nodes: Array<DataEntityLineageNode | GroupedDataEntityLineageNode>
) =>
  Array.from(nodes).reduce((map, node) => {
    if (node.groupIdList && node.groupIdList?.length > 0 && !map.has(node.id)) {
      map.set(node.id, [...node.groupIdList]);
    } else if (node.groupIdList && node.groupIdList?.length > 0) {
      map.get(node.id)?.push(...node.groupIdList);
    }
    return map;
  }, new Map<number, number[]>());

const generateMaxGroup = (
  groupIds: number[],
  depthGroups: Map<number, number[]>,
  keepInBiggestGroup: boolean
): { groupId: number; size: number } =>
  groupIds.reduce(
    ({ groupId, size }, currentGroupId) => {
      const groupSize = depthGroups?.get(currentGroupId)?.length;
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

export const groupingUpstreamNodes = (
  groupIdsBySourceId: Map<number, number[]>,
  sourceIdByDepth: Map<number, number[]>,
  minGroupSize: number,
  keepInBiggestGroup: boolean,
  excludedIds: Set<number>
): GroupingUpstreamNodes[] => {
  const startId = 2 ** 30;
  let increment = 0;

  // eslint-disable-next-line no-plusplus
  const generateNumberId = () => startId + increment++;

  const groupedNodes: GroupingUpstreamNodes[] = [];

  Array.from(sourceIdByDepth.keys()).forEach(depth => {
    const sourceIds = sourceIdByDepth.get(depth)?.filter(s => !excludedIds.has(s));
    // groupId -> sourceId[]
    const depthGroups = sourceIds?.reduce((map, sourceId) => {
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

    const groupIdsBySourceIdByDepth = new Map<number, number[]>();

    Array.from(groupIdsBySourceId.keys())
      .filter(s => sourceIds?.includes(s))
      .forEach(s => {
        const groupIds = groupIdsBySourceId.get(s);
        if (groupIds) {
          return groupIdsBySourceIdByDepth.set(s, groupIds);
        }
        return [];
      });

    const resultSourceIdsByGroupId = new Map<number, number[]>();
    const generatedGroupIdByGroupId = new Map<number, number>();

    Array.from(groupIdsBySourceIdByDepth.keys()).forEach(sourceId => {
      const groupIds = groupIdsBySourceIdByDepth.get(sourceId);

      if (depthGroups && groupIds !== undefined && groupIds.length >= 1) {
        const maxGroup = generateMaxGroup(groupIds, depthGroups, keepInBiggestGroup);

        // fill resultSourceIdsByGroupId Map with maxGroup.groupIds -> array of source ids
        if (!resultSourceIdsByGroupId.has(maxGroup.groupId)) {
          resultSourceIdsByGroupId.set(maxGroup.groupId, [sourceId]);
        } else {
          resultSourceIdsByGroupId.get(maxGroup.groupId)?.push(sourceId);
        }
      }
    });

    Array.from(resultSourceIdsByGroupId.keys()).forEach(groupId => {
      const resultSourceIds = resultSourceIdsByGroupId.get(groupId);
      if (resultSourceIds && resultSourceIds.length < minGroupSize) {
        resultSourceIdsByGroupId.delete(groupId);
      }
    });

    // fill generatedGroupIdByGroupId Map with groupId -> generated groupId
    Array.from(resultSourceIdsByGroupId.keys()).forEach(groupId =>
      generatedGroupIdByGroupId.set(groupId, generateNumberId())
    );

    Array.from(resultSourceIdsByGroupId.keys()).forEach(groupId => {
      const generatedGroupId = generatedGroupIdByGroupId.get(groupId);
      const resultSourceIds = resultSourceIdsByGroupId.get(groupId);

      if (generatedGroupId && resultSourceIds) {
        return groupedNodes.push({
          groupId,
          depthGroupId: generatedGroupId,
          depth,
          sourceIds: resultSourceIds,
        });
      }
      return {};
    });
  });

  return groupedNodes;
};

export const groupingDownstreamNodes = (
  groupIdsByTargetId: Map<number, number[]>,
  targetIdByDepth: Map<number, number[]>,
  minGroupSize: number,
  keepInBiggestGroup: boolean,
  excludedIds: Set<number>
): GroupingDownstreamNodes[] => {
  const startId = 2 ** 30;
  let increment = 0;

  // eslint-disable-next-line no-plusplus
  const generateNumberId = () => startId + increment++;

  const groupedNodes: GroupingDownstreamNodes[] = [];

  Array.from(targetIdByDepth.keys()).forEach(depth => {
    const targetIds = targetIdByDepth.get(depth)?.filter(s => !excludedIds.has(s));
    // groupId -> targetId[]
    const depthGroups = targetIds?.reduce((map, targetId) => {
      const groupIds = groupIdsByTargetId.get(targetId);
      if (groupIds !== undefined) {
        groupIds.forEach(groupId => {
          if (!map.has(groupId)) {
            map.set(groupId, [targetId]);
          } else {
            map.get(groupId)?.push(targetId);
          }
        });
      }
      return map;
    }, new Map<number, number[]>());

    const groupIdsByTargetIdByDepth = new Map<number, number[]>();

    Array.from(groupIdsByTargetId.keys())
      .filter(s => targetIds?.includes(s))
      .forEach(s => {
        const groupIds = groupIdsByTargetId.get(s);
        if (groupIds) {
          return groupIdsByTargetIdByDepth.set(s, groupIds);
        }
        return [];
      });

    const resultTargetIdsByGroupId = new Map<number, number[]>();
    const generatedGroupIdByGroupId = new Map<number, number>();

    Array.from(groupIdsByTargetIdByDepth.keys()).forEach(targetId => {
      const groupIds = groupIdsByTargetIdByDepth.get(targetId);

      if (depthGroups && groupIds !== undefined && groupIds.length >= 1) {
        const maxGroup = generateMaxGroup(groupIds, depthGroups, keepInBiggestGroup);

        // fill resultTargetIdsByGroupId Map with maxGroup.groupIds -> array of source ids
        if (!resultTargetIdsByGroupId.has(maxGroup.groupId)) {
          resultTargetIdsByGroupId.set(maxGroup.groupId, [targetId]);
        } else {
          resultTargetIdsByGroupId.get(maxGroup.groupId)?.push(targetId);
        }
      }
    });

    Array.from(resultTargetIdsByGroupId.keys()).forEach(groupId => {
      const resultTargetIds = resultTargetIdsByGroupId.get(groupId);
      if (resultTargetIds && resultTargetIds.length < minGroupSize) {
        resultTargetIdsByGroupId.delete(groupId);
      }
    });

    // fill generatedGroupIdByGroupId Map with groupId -> generated groupId
    Array.from(resultTargetIdsByGroupId.keys()).forEach(groupId =>
      generatedGroupIdByGroupId.set(groupId, generateNumberId())
    );

    Array.from(resultTargetIdsByGroupId.keys()).forEach(groupId => {
      const generatedGroupId = generatedGroupIdByGroupId.get(groupId);
      const resultTargetIds = resultTargetIdsByGroupId.get(groupId);

      if (generatedGroupId && resultTargetIds) {
        return groupedNodes.push({
          groupId,
          depthGroupId: generatedGroupId,
          depth,
          targetIds: resultTargetIds,
        });
      }
      return {};
    });
  });

  return groupedNodes;
};

export const groupNodesAndFilterEdgesForDownstream = ({
  rootNodeId,
  localLineageState,
  minGroupSize,
}: GroupNodesAndFilterEdgesParams): GroupedNodesAndFilteredEdges => {
  const { filteredEdges, targetIdsMapByDepth, crossEdges } = filterDownstreamEdges(
    rootNodeId,
    localLineageState.allEdges
  );

  const groupIdsByTargetId = generateGroupIdsMap(localLineageState.allNodes);

  const groupedDownstreamNodes = groupingDownstreamNodes(
    groupIdsByTargetId,
    targetIdsMapByDepth,
    minGroupSize,
    true,
    localLineageState.excludedIds
  );

  const depthGroupIdByTargetId = new Map<number, number>();
  groupedDownstreamNodes.forEach(node => {
    node.targetIds.forEach(targetId =>
      depthGroupIdByTargetId.set(targetId, node.depthGroupId)
    );
  });

  const replacedEdges = filteredEdges.map(edge => {
    const depthTargetGroupId = depthGroupIdByTargetId.get(edge.targetId);

    if (depthTargetGroupId) {
      return {
        sourceId: edge.sourceId,
        targetId: depthGroupIdByTargetId.has(edge.targetId)
          ? depthTargetGroupId
          : edge.targetId,
      };
    }
    return { sourceId: edge.sourceId, targetId: edge.targetId };
  });

  const resultDownstreamEdges: DataEntityLineageEdge[] = uniqWith(replacedEdges, isEqual);

  const replacedCrossEdges = crossEdges.map(edge => {
    const depthTargetGroupId = depthGroupIdByTargetId.get(edge.targetId);

    if (depthTargetGroupId) {
      return {
        sourceId: edge.sourceId,
        targetId: depthGroupIdByTargetId.has(edge.targetId)
          ? depthTargetGroupId
          : edge.targetId,
      };
    }
    return { sourceId: edge.sourceId, targetId: edge.targetId };
  });

  const resultDownstreamCrossEdges: DataEntityLineageEdge[] = uniqWith(
    replacedCrossEdges,
    isEqual
  );

  const resultDownstreamNodes: GroupedDataEntityLineageNode[] = groupedDownstreamNodes
    .map(groupNode => {
      const group = localLineageState.allGroups.find(g => g.id === groupNode.groupId)!;
      const resultNode: GroupedDataEntityLineageNode = {
        ...group,
        id: groupNode.depthGroupId,
        nodesRelatedWithDEG: localLineageState.allNodes.filter(n =>
          groupNode.targetIds.includes(n.id)
        ),
        originalGroupId: group?.id,
      };
      return resultNode;
    })
    .concat(localLineageState.allNodes);

  return {
    nodes: resultDownstreamNodes,
    edges: resultDownstreamEdges,
    crossEdges: resultDownstreamCrossEdges,
  };
};

export const parseDownstreamLineage = ({
  state,
  rootNodeId,
  rootNode,
  edges,
  nodes,
  crossEdges,
  dataEntityLineageInitialState,
}: ParseLineageParams): DataEntityLineageById => ({
  rootNode: rootNode || state[rootNodeId]?.rootNode,
  upstream: {
    ...(state[rootNodeId]?.upstream || dataEntityLineageInitialState),
  },
  downstream: {
    edgesById: edges.reduce<DataEntityLineageStreamById['edgesById']>(
      (edgesById, edge) => ({
        ...edgesById,
        [edge.sourceId]: edgesById[edge.sourceId]
          ? [...edgesById[edge.sourceId], edge]
          : [edge],
      }),
      {}
    ),
    nodesById: nodes.reduce<DataEntityLineageStreamById['nodesById']>(
      (nodesById, node) => ({
        ...nodesById,
        [node.id]: node,
      }),
      {}
    ),
    crossEdges,
  },
});

export const groupNodesAndFilterEdgesForUpstream = ({
  rootNodeId,
  localLineageState,
  minGroupSize,
}: GroupNodesAndFilterEdgesParams): GroupedNodesAndFilteredEdges => {
  const { filteredEdges, sourceIdsMapByDepth, crossEdges } = filterUpstreamEdges(
    rootNodeId,
    localLineageState.allEdges
  );

  const groupIdsBySourceId = generateGroupIdsMap(localLineageState.allNodes);

  const groupedUpstreamNodes = groupingUpstreamNodes(
    groupIdsBySourceId,
    sourceIdsMapByDepth,
    minGroupSize,
    true,
    localLineageState.excludedIds
  );

  const depthGroupIdBySourceId = new Map<number, number>();
  groupedUpstreamNodes.forEach(node => {
    node.sourceIds.forEach(sourceId =>
      depthGroupIdBySourceId.set(sourceId, node.depthGroupId)
    );
  });

  const replacedEdges = filteredEdges.map(edge => {
    const depthSourceGroupId = depthGroupIdBySourceId.get(edge.sourceId);

    if (depthSourceGroupId) {
      return {
        sourceId: depthGroupIdBySourceId.has(edge.sourceId)
          ? depthSourceGroupId
          : edge.sourceId,
        targetId: edge.targetId,
      };
    }
    return { sourceId: edge.sourceId, targetId: edge.targetId };
  });

  const resultUpstreamEdges: DataEntityLineageEdge[] = uniqWith(replacedEdges, isEqual);

  const replacedCrossEdges = crossEdges.map(edge => {
    const depthSourceGroupId = depthGroupIdBySourceId.get(edge.sourceId);

    if (depthSourceGroupId) {
      return {
        sourceId: depthGroupIdBySourceId.has(edge.sourceId)
          ? depthSourceGroupId
          : edge.sourceId,
        targetId: edge.targetId,
      };
    }
    return { sourceId: edge.sourceId, targetId: edge.targetId };
  });

  const resultUpstreamCrossEdges: DataEntityLineageEdge[] = uniqWith(
    replacedCrossEdges,
    isEqual
  );

  const resultUpstreamNodes: GroupedDataEntityLineageNode[] = groupedUpstreamNodes
    .map(groupNode => {
      const group = localLineageState.allGroups.find(g => g.id === groupNode.groupId)!;
      const resultNode: GroupedDataEntityLineageNode = {
        ...group,
        id: groupNode.depthGroupId,
        nodesRelatedWithDEG: localLineageState.allNodes.filter(n =>
          groupNode.sourceIds.includes(n.id)
        ),
        originalGroupId: group?.id,
      };
      return resultNode;
    })
    .concat(localLineageState.allNodes);

  return {
    nodes: resultUpstreamNodes,
    edges: resultUpstreamEdges,
    crossEdges: resultUpstreamCrossEdges,
  };
};

export const parseUpstreamLineage = ({
  state,
  rootNodeId,
  rootNode,
  edges,
  nodes,
  crossEdges,
  dataEntityLineageInitialState,
}: ParseLineageParams): DataEntityLineageById => ({
  rootNode: rootNode || state[rootNodeId]?.rootNode,
  upstream: {
    edgesById: edges.reduce<DataEntityLineageStreamById['edgesById']>(
      (edgesById, edge) => ({
        ...edgesById,
        [edge.targetId]: edgesById[edge.targetId]
          ? [...edgesById[edge.targetId], edge]
          : [edge],
      }),
      {}
    ),
    nodesById: nodes.reduce<DataEntityLineageStreamById['nodesById']>(
      (nodesById, node) => ({
        ...nodesById,
        [node.id]: node,
      }),
      {}
    ),
    crossEdges,
  },
  downstream: {
    ...(state[rootNodeId]?.downstream || dataEntityLineageInitialState),
  },
});
