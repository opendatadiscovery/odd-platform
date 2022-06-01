import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { DataEntityLineageState } from 'redux/interfaces';
import { dataEntityLineageActionTypePrefix } from 'redux/actions';
import {
  DataEntityLineageById,
  DataEntityLineageStreamById,
} from 'redux/interfaces/dataentityLineage';
import { setRootNode } from './dataEntityLineageHelpers';

export const initialState: DataEntityLineageState = {};

export const dataEntityLineageInitialState = {
  edgesById: {},
  nodesById: {},
};

export const dataEntityLineageSlice = createSlice({
  name: dataEntityLineageActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    // builder.addCase(
    //   thunks.fetchDataEntitiesClassesAndTypes.pending,
    //   () => initialState
    // );
    builder.addCase(
      thunks.fetchDataEntityDownstreamLineage.fulfilled,
      (state, { payload }) => {
        const { rootNodeId, dataEntityId, dataEntityLineage } = payload;
        const { root, downstream } = dataEntityLineage;
        const { edges: downstreamEdges, nodes: downstreamNodes } =
          downstream;

        const rootNode = setRootNode(
          state,
          rootNodeId,
          dataEntityId,
          root
        );

        const parsedDataEntityLineage: DataEntityLineageById = {
          rootNode,
          upstream: {
            ...(state[rootNodeId]?.upstream ||
              dataEntityLineageInitialState),
          },
          downstream: {
            edgesById: downstreamEdges.reduce<
              DataEntityLineageStreamById['edgesById']
            >(
              (edgesById, edge) => ({
                ...edgesById,
                [edge.sourceId]: edgesById[edge.sourceId]
                  ? [...edgesById[edge.sourceId], edge]
                  : [edge],
              }),
              {
                ...state[rootNodeId]?.downstream.edgesById,
              }
            ),
            nodesById: downstreamNodes.reduce<
              DataEntityLineageStreamById['nodesById']
            >(
              (nodesById, node) => ({
                ...nodesById,
                [node.id]: node,
              }),
              { ...state[rootNodeId]?.downstream.nodesById }
            ),
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
        const { edges: upstreamEdges, nodes: upstreamNodes } = upstream;

        const rootNode = setRootNode(
          state,
          rootNodeId,
          dataEntityId,
          root
        );

        const parsedDataEntityLineage: DataEntityLineageById = {
          rootNode,
          upstream: {
            edgesById: upstreamEdges.reduce<
              DataEntityLineageStreamById['edgesById']
            >(
              (edgesById, edge) => ({
                ...edgesById,
                [edge.targetId]: edgesById[edge.targetId]
                  ? [...edgesById[edge.targetId], edge]
                  : [edge],
              }),
              { ...state[rootNodeId]?.upstream.edgesById }
            ),
            nodesById: upstreamNodes.reduce<
              DataEntityLineageStreamById['nodesById']
            >(
              (nodesById, node) => ({
                ...nodesById,
                [node.id]: node,
              }),
              { ...state[rootNodeId]?.upstream.nodesById }
            ),
          },
          downstream: {
            ...(state[rootNodeId]?.downstream ||
              dataEntityLineageInitialState),
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
