import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action, PaginatedResponse } from 'redux/interfaces';
import { CollectorList } from 'generated-sources';
import { CollectorsState } from 'redux/interfaces/state';

export const initialState: CollectorsState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const updateCollectorList = (
  state: CollectorsState,
  payload: PaginatedResponse<CollectorList>
) =>
  payload.items.reduce(
    (memo: CollectorsState, collector) => ({
      ...memo,
      byId: {
        ...memo.byId,
        [collector.id]: {
          ...memo.byId[collector.id],
          ...collector,
        },
      },
      allIds: [...memo.allIds, collector.id],
    }),
    {
      ...state,
      allIds: payload.pageInfo?.page > 1 ? [...state.allIds] : [],
      pageInfo: payload.pageInfo,
    }
  );

const reducer = (
  state = initialState,
  action: Action
): CollectorsState => {
  switch (action.type) {
    case getType(actions.fetchCollectorsAction.success):
      return updateCollectorList(state, action.payload);
    case getType(actions.registerCollectorAction.success):
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
    case getType(actions.updateCollectorAction.success):
    case getType(actions.regenerateCollectorTokenAction.success):
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
    case getType(actions.deleteCollectorAction.success):
      return {
        ...state,
        allIds: state.allIds.filter(
          collectorId => collectorId !== action.payload.collectorId
        ),
      };
    default:
      return state;
  }
};

export default reducer;
