import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { DataEntityGroupLinkedListState } from 'redux/interfaces/state';

export const initialState: DataEntityGroupLinkedListState = {
  linkedItemsIdsByDataEntityGroupId: {},
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const reducer = (
  state = initialState,
  action: Action
): DataEntityGroupLinkedListState => {
  switch (action.type) {
    case getType(actions.fetchDataEntityGroupLinkedListAction.success):
      return action.payload.value.items.reduce(
        (memo: DataEntityGroupLinkedListState, linkedItem) => ({
          ...memo,
          linkedItemsIdsByDataEntityGroupId: {
            ...memo.linkedItemsIdsByDataEntityGroupId,
            [action.payload.entityId]: [
              ...(memo.linkedItemsIdsByDataEntityGroupId?.[
                action.payload.entityId
              ] || []),
              linkedItem.id,
            ],
          },
        }),
        {
          ...state,
          pageInfo: action.payload.pageInfo,
        }
      );
    default:
      return state;
  }
};

export default reducer;
