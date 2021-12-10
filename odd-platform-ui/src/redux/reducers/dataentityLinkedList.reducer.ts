import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { DataEntityGroupLinkedListState } from 'redux/interfaces/state';

export const initialState: DataEntityGroupLinkedListState = {
  linkedListByDataEntityGroupId: {},
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
          linkedListByDataEntityGroupId: {
            ...memo.linkedListByDataEntityGroupId,
            [action.payload.entityId]: [
              ...(memo.linkedListByDataEntityGroupId[
                action.payload.entityId
              ] || []),
              linkedItem,
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
