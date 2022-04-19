import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action, TermDetailsState } from 'redux/interfaces';
import omit from 'lodash/omit';

export const initialState: TermDetailsState = {
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
): TermDetailsState => {
  switch (action.type) {
    case getType(actions.fetchTermDetailsAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...omit(action.payload, ['ownership']), // Ownership is being stored in OwnersState
          },
        },
      };
    case getType(actions.updateTermDetailsTagsAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.termId]: {
            ...state.byId[action.payload.termId],
            tags: action.payload.value,
          },
        },
      };
    default:
      return state;
  }
};

export default reducer;
