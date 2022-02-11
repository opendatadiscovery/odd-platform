import { getType } from 'typesafe-actions';
import { Action, TokensState } from '../interfaces';
import * as actions from '../actions';

export const initialState: TokensState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const reducer = (state = initialState, action: Action): TokensState => {
  switch (action.type) {
    case getType(actions.updateTokenAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...action.payload,
          },
        },
      };
    default:
      return state;
  }
};

export default reducer;
