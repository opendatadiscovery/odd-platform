import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import type {
  DataEntityLineageState,
  DataEntityLineageStreamById,
  ExpandEntitiesFromGroupParams,
  LocalLineageState,
} from 'redux/interfaces';
import { dataEntityLineageActionTypePrefix } from 'redux/actions';
import {
  groupNodesAndFilterEdgesForDownstream,
  groupNodesAndFilterEdgesForUpstream,
  isRootNodeIdsEqual,
  parseDownstreamLineage,
  parseUpstreamLineage,
  resetLocalState,
  setRootNode,
} from './dataEntityLineageHelpers';

export const initialState: DataEntityLineageState = {};

export const dataEntityLineageInitialState: DataEntityLineageStreamById = {
  edgesById: {},
  nodesById: {},
  crossEdges: [],
};

const localUpstreamState: LocalLineageState = {
  allNodes: [],
  nodeIds: new Set<number>(),
  allEdges: [],
  allGroups: [],
  groupIds: new Set<number>(),
  excludedIds: new Set<number>(),
};

const localDownstreamState: LocalLineageState = {
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
  reducers: {
    expandEntitiesFromDownstreamGroup: (
      state,
      { payload }: ExpandEntitiesFromGroupParams
    ): DataEntityLineageState => {
      const { rootNodeId, idsToExclude } = payload;

      localDownstreamState.excludedIds = new Set<number>([
        ...localDownstreamState.excludedIds,
        ...idsToExclude,
      ]);

      const {
        nodes: downstreamNodes,
        edges: downstreamEdges,
        crossEdges: downstreamCrossEdges,
      } = groupNodesAndFilterEdgesForDownstream({
        rootNodeId,
        localLineageState: localDownstreamState,
        minGroupSize,
      });

      const parsedDataEntityLineage = parseDownstreamLineage({
        state,
        rootNodeId,
        nodes: downstreamNodes,
        edges: downstreamEdges,
        crossEdges: downstreamCrossEdges,
        dataEntityLineageInitialState,
      });

      return {
        ...state,
        [rootNodeId]: parsedDataEntityLineage,
      };
    },
    expandEntitiesFromUpstreamGroup: (
      state,
      { payload }: ExpandEntitiesFromGroupParams
    ): DataEntityLineageState => {
      const { rootNodeId, idsToExclude } = payload;

      localUpstreamState.excludedIds = new Set<number>([
        ...localUpstreamState.excludedIds,
        ...idsToExclude,
      ]);

      const {
        nodes: upstreamNodes,
        edges: upstreamEdges,
        crossEdges: upstreamCrossEdges,
      } = groupNodesAndFilterEdgesForUpstream({
        rootNodeId,
        localLineageState: localUpstreamState,
        minGroupSize,
      });

      const parsedDataEntityLineage = parseUpstreamLineage({
        state,
        rootNodeId,
        nodes: upstreamNodes,
        edges: upstreamEdges,
        crossEdges: upstreamCrossEdges,
        dataEntityLineageInitialState,
      });

      return {
        ...state,
        [rootNodeId]: parsedDataEntityLineage,
      };
    },
  },

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

        const {
          edges: resultDownstreamEdges,
          nodes: resultDownstreamNodes,
          crossEdges: resultDownstreamCrossEdges,
        } = groupNodesAndFilterEdgesForDownstream({
          rootNodeId,
          localLineageState: localDownstreamState,
          minGroupSize,
        });

        const parsedDataEntityLineage = parseDownstreamLineage({
          state,
          rootNodeId,
          rootNode,
          nodes: resultDownstreamNodes,
          edges: resultDownstreamEdges,
          crossEdges: resultDownstreamCrossEdges,
          dataEntityLineageInitialState,
        });

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

        const {
          edges: resultUpstreamEdges,
          nodes: resultUpstreamNodes,
          crossEdges: resultUpstreamCrossEdges,
        } = groupNodesAndFilterEdgesForUpstream({
          rootNodeId,
          localLineageState: localUpstreamState,
          minGroupSize,
        });

        const parsedDataEntityLineage = parseUpstreamLineage({
          state,
          rootNodeId,
          rootNode,
          nodes: resultUpstreamNodes,
          edges: resultUpstreamEdges,
          crossEdges: resultUpstreamCrossEdges,
          dataEntityLineageInitialState,
        });

        return {
          ...state,
          [rootNodeId]: parsedDataEntityLineage,
        };
      }
    );
  },
});

export const { expandEntitiesFromDownstreamGroup, expandEntitiesFromUpstreamGroup } =
  dataEntityLineageSlice.actions;

export default dataEntityLineageSlice.reducer;
