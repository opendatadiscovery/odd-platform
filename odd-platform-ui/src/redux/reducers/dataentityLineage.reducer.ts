import { Action } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { DataEntityLineageState } from '../interfaces';
import { DataEntityLineageStreamById } from '../interfaces/dataentityLineage';

export const initialState: DataEntityLineageState = {};

const reducer = (
  state = initialState,
  action: Action
): DataEntityLineageState => {
  switch (action.type) {
    case getType(actions.fetchDataEntityLineageAction.success):
      return {
        ...state,
        [action.payload.dataEntityId]: {
          root: action.payload.value.root,
          upstream: {
            edgesById: action.payload.value.upstream.edges
              ? action.payload.value.upstream.edges.reduce<
                  DataEntityLineageStreamById['edgesById']
                >(
                  (memo, edge) => ({
                    ...memo,
                    [edge.targetId]: memo[edge.targetId]
                      ? [...memo[edge.targetId], edge]
                      : [edge],
                  }),
                  {}
                )
              : {},
            nodesById: action.payload.value.upstream.nodes
              ? action.payload.value.upstream.nodes.reduce<
                  DataEntityLineageStreamById['nodesById']
                >(
                  (memo, node) => ({
                    ...memo,
                    [node.id]: node,
                  }),
                  {}
                )
              : {},
          },
          downstream: {
            edgesById: action.payload.value.downstream.edges
              ? action.payload.value.downstream.edges.reduce<
                  DataEntityLineageStreamById['edgesById']
                >(
                  (memo, edge) => ({
                    ...memo,
                    [edge.sourceId]: memo[edge.sourceId]
                      ? [...memo[edge.sourceId], edge]
                      : [edge],
                  }),
                  {}
                )
              : {},
            nodesById: action.payload.value.downstream.nodes
              ? action.payload.value.downstream.nodes.reduce<
                  DataEntityLineageStreamById['nodesById']
                >(
                  (memo, node) => ({
                    ...memo,
                    [node.id]: node,
                  }),
                  {}
                )
              : {},
          },
        },
      };
    default:
      return state;
  }
};

export default reducer;
