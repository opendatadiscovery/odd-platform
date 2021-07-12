import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { OwnersState } from 'redux/interfaces/state';
import { filter } from 'lodash';

export const initialState: OwnersState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
  ownership: {},
};

const reducer = (state = initialState, action: Action): OwnersState => {
  switch (action.type) {
    case getType(actions.fetchOwnersAction.success):
      return action.payload.items.reduce(
        (memo: OwnersState, owner) => ({
          ...memo,
          byId: {
            ...memo.byId,
            [owner.id]: {
              ...memo.byId[owner.id],
              ...owner,
            },
          },
          allIds: [...memo.allIds, owner.id],
        }),
        {
          ...state,
          allIds:
            action.payload.pageInfo?.page > 1 ? [...state.allIds] : [],
          pageInfo: action.payload.pageInfo,
        }
      );
    case getType(actions.fetchDataEntityAction.success):
      return {
        ...state,
        ownership: {
          ...state.ownership,
          ...(action.payload.ownership && {
            [action.payload.id]: {
              byId: action.payload.ownership.reduce(
                (memo, ownership) => ({
                  ...memo,
                  [ownership.id]: ownership,
                }),
                {}
              ),
              allIds: action.payload.ownership.map(
                ownership => ownership.id
              ),
            },
          }),
        },
      };
    case getType(actions.updateOwnerAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload,
        },
      };
    case getType(actions.createDataEntityOwnershipAction.success):
      return {
        ...state,
        ownership: {
          ...state.ownership,
          [action.payload.dataEntityId]: {
            byId: {
              ...state.ownership[action.payload.dataEntityId].byId,
              [action.payload.value.id]: action.payload.value,
            },
            allIds: [
              action.payload.value.id,
              ...state.ownership[action.payload.dataEntityId].allIds,
            ],
          },
        },
      };
    case getType(actions.updateDataEntityOwnershipAction.success):
      return {
        ...state,
        ownership: {
          ...state.ownership,
          [action.payload.dataEntityId]: {
            ...state.ownership[action.payload.dataEntityId],
            byId: {
              ...state.ownership[action.payload.dataEntityId].byId,
              [action.payload.value.id]: action.payload.value,
            },
          },
        },
      };
    case getType(actions.deleteDataEntityOwnershipAction.success):
      return {
        ...state,
        ownership: {
          ...state.ownership,
          [action.payload.dataEntityId]: {
            ...state.ownership[action.payload.dataEntityId],
            allIds: filter(
              state.ownership[action.payload.dataEntityId].allIds,
              item => item !== action.payload.value
            ),
          },
        },
      };
    default:
      return state;
  }
};

export default reducer;
