import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action, PaginatedResponse } from 'redux/interfaces';
import { DataSourceList } from 'generated-sources';
import { DataSourcesState } from 'redux/interfaces/state';

export const initialState: DataSourcesState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const updateDataSourceList = (
  state: DataSourcesState,
  payload: PaginatedResponse<DataSourceList>
) =>
  payload.items.reduce(
    (memo: DataSourcesState, dataSource) => ({
      ...memo,
      byId: {
        ...memo.byId,
        [dataSource.id]: {
          ...memo.byId[dataSource.id],
          ...dataSource,
        },
      },
      allIds: [...memo.allIds, dataSource.id],
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
): DataSourcesState => {
  switch (action.type) {
    case getType(actions.fetchDataSourcesAction.success):
      return updateDataSourceList(state, action.payload);
    case getType(actions.registerDataSourceAction.success):
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
    case getType(actions.updateDataSourceAction.success):
    case getType(actions.regenerateDataSourceTokenAction.success):
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
    case getType(actions.deleteDataSourceAction.success):
      return {
        ...state,
        allIds: state.allIds.filter(
          dataSourceId => dataSourceId !== action.payload.dataSourceId
        ),
      };
    default:
      return state;
  }
};

export default reducer;
