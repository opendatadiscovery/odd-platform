import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import {
  DataEntityLineageById,
  DataEntityLineageState,
  DataEntityLineageStreamById,
  GroupedDataEntityLineageNode,
  LocalState,
} from 'redux/interfaces';
import { dataEntityLineageActionTypePrefix } from 'redux/actions';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import { DataEntityLineageEdge } from 'generated-sources';
import {
  filterDownstreamEdges,
  filterUpstreamEdges,
  generateGroupIdsMap,
  groupingDownstreamNodes,
  groupingUpstreamNodes,
  isRootNodeIdsEqual,
  resetLocalState,
  setRootNode,
} from './dataEntityLineageHelpers';

export const initialState: DataEntityLineageState = {};

export const dataEntityLineageInitialState = {
  edgesById: {},
  nodesById: {},
};

const localUpstreamState: LocalState = {
  allNodes: [],
  nodeIds: new Set<number>(),
  allEdges: [],
  allGroups: [],
  groupIds: new Set<number>(),
  excludedIds: new Set<number>(),
};

const localDownstreamState: LocalState = {
  allNodes: [],
  nodeIds: new Set<number>(),
  allEdges: [],
  allGroups: [],
  groupIds: new Set<number>(),
  excludedIds: new Set<number>(),
};

const minGroupSize = 4;

export const dataEntityLineageSlice = createSlice({
  name: dataEntityLineageActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchDataEntityDownstreamLineage.fulfilled,
      (state, { payload }) => {
        const { rootNodeId, dataEntityId, dataEntityLineage } = payload;
        const { root, downstream } = dataEntityLineage;
        const {
          edges: downstreamEdges,
          nodes: downstreamNodes,
          groups: downstreamGroups,
        } = downstream;

        if (isRootNodeIdsEqual(rootNodeId, dataEntityId)) {
          resetLocalState(localDownstreamState);
        }

        downstreamNodes.forEach(node => {
          if (!localDownstreamState.nodeIds.has(node.id)) {
            localDownstreamState.allNodes.push(node);
            localDownstreamState.nodeIds.add(node.id);
          }
        });

        localDownstreamState.allEdges.push(...downstreamEdges);

        downstreamGroups.forEach(group => {
          if (!localDownstreamState.groupIds.has(group.id)) {
            localDownstreamState.allGroups.push(group);
            localDownstreamState.groupIds.add(group.id);
          }
        });

        localDownstreamState.excludedIds.add(root.id);

        const rootNode = setRootNode(state, rootNodeId, dataEntityId, root);

        const { filteredEdges, targetIdsMapByDepth, crossEdges } = filterDownstreamEdges(
          rootNodeId,
          localDownstreamState.allEdges
        );

        const groupIdsByTargetId = generateGroupIdsMap(localDownstreamState.allNodes);

        const groupedDownstreamNodes = groupingDownstreamNodes(
          groupIdsByTargetId,
          targetIdsMapByDepth,
          minGroupSize,
          true,
          localDownstreamState.excludedIds
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
          return {
            sourceId: edge.sourceId,
            targetId: edge.targetId,
          };
        });

        const resultDownstreamEdges: DataEntityLineageEdge[] = uniqWith(
          replacedEdges,
          isEqual
        );

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
          return {
            sourceId: edge.sourceId,
            targetId: edge.targetId,
          };
        });

        const resultDownstreamCrossEdges: DataEntityLineageEdge[] = uniqWith(
          replacedCrossEdges,
          isEqual
        );

        const resultDownstreamNodes: GroupedDataEntityLineageNode[] =
          groupedDownstreamNodes
            .map(groupNode => {
              const group = localDownstreamState.allGroups.find(
                g => g.id === groupNode.groupId
              );
              const resultNode: GroupedDataEntityLineageNode = {
                ...group,
                id: groupNode.depthGroupId,
                nodesRelatedWithDEG: localDownstreamState.allNodes.filter(n =>
                  groupNode.targetIds.includes(n.id)
                ),
                originalGroupId: group?.id,
              };
              return resultNode;
            })
            .concat(localDownstreamState.allNodes);

        const parsedDataEntityLineage: DataEntityLineageById = {
          rootNode,
          upstream: {
            ...(state[rootNodeId]?.upstream || dataEntityLineageInitialState),
          },
          downstream: {
            edgesById: resultDownstreamEdges.reduce<
              DataEntityLineageStreamById['edgesById']
            >(
              (edgesById, edge) => ({
                ...edgesById,
                [edge.sourceId]: edgesById[edge.sourceId]
                  ? [...edgesById[edge.sourceId], edge]
                  : [edge],
              }),
              {}
            ),
            nodesById: resultDownstreamNodes.reduce<
              DataEntityLineageStreamById['nodesById']
            >(
              (nodesById, node) => ({
                ...nodesById,
                [node.id]: node,
              }),
              {}
            ),
            crossEdges: resultDownstreamCrossEdges,
          },
        };

        return {
          ...state,
          [rootNodeId]: parsedDataEntityLineage,
        };
      }
    );

    builder.addCase(
      thunks.fetchDataEntityUpstreamLineage.fulfilled,
      (state, { payload }) => {
        const { rootNodeId, dataEntityId, dataEntityLineage } = payload;
        const { root, upstream } = dataEntityLineage;
        const {
          edges: upstreamEdges,
          nodes: upstreamNodes,
          groups: upstreamGroups,
        } = upstream;

        if (isRootNodeIdsEqual(rootNodeId, dataEntityId)) {
          resetLocalState(localUpstreamState);
        }

        upstreamNodes.forEach(node => {
          if (!localUpstreamState.nodeIds.has(node.id)) {
            localUpstreamState.allNodes.push(node);
            localUpstreamState.nodeIds.add(node.id);
          }
        });

        localUpstreamState.allEdges.push(...upstreamEdges);

        upstreamGroups.forEach(group => {
          if (!localUpstreamState.groupIds.has(group.id)) {
            localUpstreamState.allGroups.push(group);
            localUpstreamState.groupIds.add(group.id);
          }
        });

        localUpstreamState.excludedIds.add(root.id);

        const rootNode = setRootNode(state, rootNodeId, dataEntityId, root);

        const { filteredEdges, sourceIdsMapByDepth, crossEdges } = filterUpstreamEdges(
          rootNodeId,
          localUpstreamState.allEdges
        );

        const groupIdsBySourceId = generateGroupIdsMap(localUpstreamState.allNodes);

        const groupedUpstreamNodes = groupingUpstreamNodes(
          groupIdsBySourceId,
          sourceIdsMapByDepth,
          minGroupSize,
          true,
          localUpstreamState.excludedIds
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
          return {
            sourceId: edge.sourceId,
            targetId: edge.targetId,
          };
        });

        const resultUpstreamEdges: DataEntityLineageEdge[] = uniqWith(
          replacedEdges,
          isEqual
        );

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
          return {
            sourceId: edge.sourceId,
            targetId: edge.targetId,
          };
        });

        const resultUpstreamCrossEdges: DataEntityLineageEdge[] = uniqWith(
          replacedCrossEdges,
          isEqual
        );

        const resultUpstreamNodes: GroupedDataEntityLineageNode[] = groupedUpstreamNodes
          .map(groupNode => {
            const group = localUpstreamState.allGroups.find(
              g => g.id === groupNode.groupId
            );
            const resultNode: GroupedDataEntityLineageNode = {
              ...group,
              id: groupNode.depthGroupId,
              nodesRelatedWithDEG: localUpstreamState.allNodes.filter(n =>
                groupNode.sourceIds.includes(n.id)
              ),
              originalGroupId: group?.id,
            };
            return resultNode;
          })
          .concat(localUpstreamState.allNodes);

        const parsedDataEntityLineage: DataEntityLineageById = {
          rootNode,
          upstream: {
            edgesById: resultUpstreamEdges.reduce<
              DataEntityLineageStreamById['edgesById']
            >(
              (edgesById, edge) => ({
                ...edgesById,
                [edge.targetId]: edgesById[edge.targetId]
                  ? [...edgesById[edge.targetId], edge]
                  : [edge],
              }),
              {}
            ),
            nodesById: resultUpstreamNodes.reduce<
              DataEntityLineageStreamById['nodesById']
            >(
              (nodesById, node) => ({
                ...nodesById,
                [node.id]: node,
              }),
              {}
            ),
            crossEdges: resultUpstreamCrossEdges,
          },
          downstream: {
            ...(state[rootNodeId]?.downstream || dataEntityLineageInitialState),
          },
        };

        return {
          ...state,
          [rootNodeId]: parsedDataEntityLineage,
        };
      }
    );
  },
});

export default dataEntityLineageSlice.reducer;
