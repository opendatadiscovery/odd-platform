import { Action, DataEntitiesState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import { keyBy, omit } from 'lodash';
import * as actions from 'redux/actions';

export const initialState: DataEntitiesState = {
  typesDict: {
    types: {},
    subtypes: {},
  },
  byId: {},
  allIds: [],
  my: [],
  myUpstream: [],
  myDownstream: [],
  popular: [],
};

const reducer = (
  state = initialState,
  action: Action
): DataEntitiesState => {
  switch (action.type) {
    case getType(actions.fetchDataEntitiesTypesAction.success):
      return {
        ...state,
        typesDict: {
          types: keyBy(action.payload.types, 'id'),
          subtypes: keyBy(action.payload.subtypes, 'id'),
        },
      };
    case getType(actions.fetchDataEntityAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...omit(action.payload, ['metadata', 'ownership']), // Metadata and Ownership are being stored in MetadataState and OwnersState
          },
        },
      };
    case getType(actions.updateDataEntityTagsAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.entityId]: {
            ...state.byId[action.payload.entityId],
            tags: action.payload.value,
          },
        },
      };
    case getType(actions.updateDataEntityDescriptionAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.entityId]: {
            ...state.byId[action.payload.entityId],
            internalDescription: action.payload.value,
          },
        },
      };
    case getType(actions.updateDataEntityInternalName.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.entityId]: {
            ...state.byId[action.payload.entityId],
            internalName: action.payload.value.internalName,
          },
        },
      };
    case getType(actions.fetchMyDataEntitiesAction.success):
      return {
        ...state,
        my: action.payload,
      };
    case getType(actions.fetchMyUpstreamDataEntitiesAction.success):
      return {
        ...state,
        myUpstream: action.payload,
      };
    case getType(actions.fetchMyDownstreamDataEntitiesAction.success):
      return {
        ...state,
        myDownstream: action.payload,
      };
    case getType(actions.fetchPopularDataEntitiesAction.success):
      return {
        ...state,
        popular: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
