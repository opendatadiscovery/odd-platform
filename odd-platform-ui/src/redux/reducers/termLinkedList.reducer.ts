import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { TermLinkedListState } from 'redux/interfaces/state';

export const initialState: TermLinkedListState = {
  linkedItemsIdsByTermId: {},
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const reducer = (
  state = initialState,
  action: Action
): TermLinkedListState => {
  switch (action.type) {
    case getType(actions.fetchTermLinkedListAction.success):
      return {
        ...state,
        linkedItemsIdsByTermId: action.payload.value.items.reduce(
          (
            memo: TermLinkedListState['linkedItemsIdsByTermId'],
            linkedItem
          ) => ({
            ...memo,
            [action.payload.termId]: [
              ...(memo?.[action.payload.termId] || []),
              linkedItem.id,
            ],
          }),
          {}
        ),
        pageInfo: action.payload.pageInfo,
      };
    default:
      return state;
  }
};

export default reducer;
