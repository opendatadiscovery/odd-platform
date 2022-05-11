import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action, TermsState } from 'redux/interfaces';
import omit from 'lodash/omit';

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
    case getType(actions.deleteTermAction.success):
      return {
        ...state,
        allIds: state.allIds.filter(
          termId => termId !== action.payload.id
        ),
      };
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
    case getType(actions.updateTermAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload,
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
