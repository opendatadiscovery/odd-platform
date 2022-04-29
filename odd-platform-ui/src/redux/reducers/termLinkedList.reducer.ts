import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { TermGroupLinkedListState } from 'redux/interfaces/state';

export const initialState: TermGroupLinkedListState = {
  linkedItemsIdsByTermGroupId: {},
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const reducer = (
  state = initialState,
  action: Action
): TermGroupLinkedListState => {
  switch (action.type) {
    case getType(actions.fetchDataEntityGroupLinkedListAction.success):
      return {
        ...state,
        linkedItemsIdsByTermGroupId: action.payload.value.items.reduce(
          (
            memo: TermGroupLinkedListState['linkedItemsIdsByTermGroupId'],
            linkedItem
          ) => ({
            ...memo,
            [action.payload.entityId]: [
              ...(memo?.[action.payload.entityId] || []),
              linkedItem.id,
            ],
          }),
          { ...state, pageInfo: action.payload.pageInfo }
        ),
      };
    default:
      return state;
  }
};

export default reducer;
