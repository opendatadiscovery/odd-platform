import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { OwnersState } from 'redux/interfaces/state';
import filter from 'lodash/filter';

export const initialState: OwnersState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
  ownershipDataEntity: {},
  ownershipTermDetails: {},
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
        ownershipDataEntity: {
          ...state.ownershipDataEntity,
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
        ownershipDataEntity: {
          ...state.ownershipDataEntity,
          [action.payload.entityId]: {
            byId: {
              ...state.ownershipDataEntity[action.payload.entityId].byId,
              [action.payload.value.id]: action.payload.value,
            },
            allIds: [
              action.payload.value.id,
              ...state.ownershipDataEntity[action.payload.entityId].allIds,
            ],
          },
        },
      };
    case getType(actions.updateDataEntityOwnershipAction.success):
      return {
        ...state,
        ownershipDataEntity: {
          ...state.ownershipDataEntity,
          [action.payload.entityId]: {
            ...state.ownershipDataEntity[action.payload.entityId],
            byId: {
              ...state.ownershipDataEntity[action.payload.entityId].byId,
              [action.payload.value.id]: action.payload.value,
            },
          },
        },
      };
    case getType(actions.deleteDataEntityOwnershipAction.success):
      return {
        ...state,
        ownershipDataEntity: {
          ...state.ownershipDataEntity,
          [action.payload.entityId]: {
            ...state.ownershipDataEntity[action.payload.entityId],
            allIds: filter(
              state.ownershipDataEntity[action.payload.entityId].allIds,
              item => item !== action.payload.value
            ),
          },
        },
      };
    case getType(actions.fetchTermDetailsAction.success):
      return {
        ...state,
        ownershipTermDetails: {
          ...state.ownershipTermDetails,
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
    case getType(actions.createTermDetailsOwnershipAction.success):
      return {
        ...state,
        ownershipTermDetails: {
          ...state.ownershipTermDetails,
          [action.payload.termId]: {
            byId: {
              ...state.ownershipTermDetails[action.payload.termId].byId,
              [action.payload.value.id]: action.payload.value,
            },
            allIds: [
              action.payload.value.id,
              ...state.ownershipTermDetails[action.payload.termId].allIds,
            ],
          },
        },
      };
    case getType(actions.updateTermDetailsOwnershipAction.success):
      return {
        ...state,
        ownershipTermDetails: {
          ...state.ownershipTermDetails,
          [action.payload.termId]: {
            ...state.ownershipTermDetails[action.payload.termId],
            byId: {
              ...state.ownershipTermDetails[action.payload.termId].byId,
              [action.payload.value.id]: action.payload.value,
            },
          },
        },
      };
    case getType(actions.deleteTermDetailsOwnershipAction.success):
      return {
        ...state,
        ownershipTermDetails: {
          ...state.ownershipTermDetails,
          [action.payload.termId]: {
            ...state.ownershipTermDetails[action.payload.termId],
            allIds: filter(
              state.ownershipTermDetails[action.payload.termId].allIds,
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
