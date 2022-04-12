import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { TermsState } from 'redux/interfaces/state';

export const initialState: TermsState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const reducer = (state = initialState, action: Action): TermsState => {
  switch (action.type) {
    case getType(actions.createTermAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...action.payload,
          },
        },
        allIds: [action.payload.id, ...state.allIds],
      };
    case getType(actions.updateTermAction.success):
    case getType(actions.deleteTermAction.success):
      return {
        ...state,
        allIds: state.allIds.filter(
          termId => termId !== action.payload.id
        ),
      };
    default:
      return state;
  }
};

export default reducer;
