import { getType } from 'typesafe-actions';
import { filter } from 'lodash';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { TagsState } from 'redux/interfaces/state';

export const initialState: TagsState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const reducer = (state = initialState, action: Action): TagsState => {
  switch (action.type) {
    case getType(actions.fetchTagsAction.success):
      return action.payload.items.reduce(
        (memo: TagsState, tag) => ({
          ...memo,
          byId: {
            ...memo.byId,
            [tag.id]: {
              ...memo.byId[tag.id],
              ...tag,
            },
          },
          allIds: [...memo.allIds, tag.id],
        }),
        {
          ...state,
          allIds:
            action.payload.pageInfo?.page > 1 ? [...state.allIds] : [],
          pageInfo: action.payload.pageInfo,
        }
      );
    case getType(actions.createTagsAction.success):
      return action.payload.reduce(
        (memo: TagsState, tag) => ({
          ...memo,
          byId: {
            ...memo.byId,
            [tag.id]: tag,
          },
          allIds: [tag.id, ...memo.allIds],
        }),
        state
      );
    case getType(actions.updateTagAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload,
        },
      };
    case getType(actions.deleteTagAction.success):
      return {
        ...state,
        allIds: filter(state.allIds, tagId => tagId !== action.payload),
      };
    default:
      return state;
  }
};

export default reducer;
