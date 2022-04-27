import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action, TermsState, PaginatedResponse } from 'redux/interfaces';
import { TermRefList } from 'generated-sources';

export const initialState: TermsState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
  termsDataEntity: {},
};
const updateTermList = (
  state: TermsState,
  payload: PaginatedResponse<TermRefList>
) =>
  payload.items.reduce(
    (memo: TermsState, term) => ({
      ...memo,
      byId: {
        ...memo.byId,
        [term.id]: {
          ...memo.byId[term.id],
          ...term,
        },
      },
      allIds: [...memo.allIds, term.id],
    }),
    {
      ...state,
      allIds: payload.pageInfo?.page > 1 ? [...state.allIds] : [],
      pageInfo: payload.pageInfo,
    }
  );

const reducer = (state = initialState, action: Action): TermsState => {
  switch (action.type) {
    case getType(actions.fetchTermsAction.success):
      return updateTermList(state, action.payload);
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
    case getType(actions.fetchDataEntityAction.success):
      return {
        ...state,
        termsDataEntity: {
          ...state.termsDataEntity,
          ...(action.payload.terms && {
            [action.payload.id]: {
              byId: action.payload.terms.reduce(
                (memo, term) => ({
                  ...memo,
                  [term.id]: term,
                }),
                {}
              ),
              allIds: action.payload.terms.map(term => term.id),
            },
          }),
        },
      };
    default:
      return state;
  }
};

export default reducer;
