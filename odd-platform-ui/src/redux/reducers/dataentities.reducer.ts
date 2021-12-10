import { Action, DataEntitiesState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import keyBy from 'lodash/keyBy';
import omit from 'lodash/omit';
import { DataEntityDetails } from 'generated-sources';
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

const updateDataEntity = (
  state: DataEntitiesState,
  payload: DataEntityDetails
): DataEntitiesState => {
  let unknownSourcesCount = 0;
  let unknownTargetsCount = 0;
  let unknownInputsCount = 0;
  let unknownOutputsCount = 0;
  const sourceList = payload.sourceList?.filter(source => {
    if (source.externalName) return true;
    unknownSourcesCount += 1;
    return false;
  });
  const targetList = payload.targetList?.filter(target => {
    if (target.externalName) return true;
    unknownTargetsCount += 1;
    return false;
  });
  const inputList = payload.inputList?.filter(input => {
    if (input.externalName) return true;
    unknownInputsCount += 1;
    return false;
  });
  const outputList = payload.outputList?.filter(output => {
    if (output.externalName) return true;
    unknownOutputsCount += 1;
    return false;
  });

  return {
    ...state,
    byId: {
      ...state.byId,
      [payload.id]: {
        ...state.byId[payload.id],
        ...omit(payload, ['metadata', 'ownership']), // Metadata and Ownership are being stored in MetadataState and OwnersState
        sourceList,
        unknownSourcesCount,
        targetList,
        unknownTargetsCount,
        inputList,
        unknownInputsCount,
        outputList,
        unknownOutputsCount,
      },
    },
  };
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
      return updateDataEntity(state, action.payload);
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
