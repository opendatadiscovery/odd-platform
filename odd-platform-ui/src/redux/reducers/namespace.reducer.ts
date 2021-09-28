import { getType } from 'typesafe-actions';
import { filter } from 'lodash';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { NamespacesState } from 'redux/interfaces/state';

export const initialState: NamespacesState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const reducer = (
  state = initialState,
  action: Action
): NamespacesState => {
  switch (action.type) {
    case getType(actions.fetchNamespacesAction.success):
      return action.payload.items.reduce(
        (memo: NamespacesState, namespace) => ({
          ...memo,
          byId: {
            ...memo.byId,
            [namespace.id]: {
              ...memo.byId[namespace.id],
              ...namespace,
            },
          },
          allIds: [...memo.allIds, namespace.id],
        }),
        {
          ...state,
          allIds:
            action.payload.pageInfo?.page > 1 ? [...state.allIds] : [],
          pageInfo: action.payload.pageInfo,
        }
      );
    case getType(actions.createNamespacesAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload,
        },
        allIds: [action.payload.id, ...state.allIds],
      };
    case getType(actions.updateNamespaceAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload,
        },
      };
    case getType(actions.deleteNamespaceAction.success):
      return {
        ...state,
        allIds: filter(
          state.allIds,
          namespaceId => namespaceId !== action.payload
        ),
      };
    default:
      return state;
  }
};

export default reducer;
