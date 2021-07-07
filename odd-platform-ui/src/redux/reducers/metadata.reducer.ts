import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action, MetaDataState } from 'redux/interfaces';
import { filter, uniq } from 'lodash';

export const initialState: MetaDataState = {
  dataEntityMetadata: {},
  metadataFields: [],
};

const reducer = (state = initialState, action: Action): MetaDataState => {
  switch (action.type) {
    case getType(actions.fetchDataEntityAction.success):
      return {
        ...state,
        dataEntityMetadata: {
          ...state.dataEntityMetadata,
          [action.payload.id]: {
            byId: action.payload.metadataFieldValues.reduce(
              (memo, metadata) => ({
                ...memo,
                [metadata.field.id]: metadata,
              }),
              {}
            ),
            allIds: action.payload.metadataFieldValues.map(
              metadata => metadata.field.id
            ),
          },
        },
      };
    case getType(actions.createDataEntityMetadataAction.success):
      return {
        ...state,
        dataEntityMetadata: {
          ...state.dataEntityMetadata,
          [action.payload.dataEntityId]: {
            byId: action.payload.value.reduce(
              (memo, metadata) => ({
                ...memo,
                [metadata.field.id]: metadata,
              }),
              state.dataEntityMetadata[action.payload.dataEntityId].byId
            ),
            allIds: uniq([
              ...action.payload.value.map(metadata => metadata.field.id),
              ...state.dataEntityMetadata[action.payload.dataEntityId]
                .allIds,
            ]),
          },
        },
      };
    case getType(actions.updateDataEntityMetadataAction.success):
      return {
        ...state,
        dataEntityMetadata: {
          ...state.dataEntityMetadata,
          [action.payload.dataEntityId]: {
            ...state.dataEntityMetadata[action.payload.dataEntityId],
            byId: {
              ...state.dataEntityMetadata[action.payload.dataEntityId]
                .byId,
              [action.payload.value.field.id]: action.payload.value,
            },
          },
        },
      };
    case getType(actions.searchMetadataAction.success):
      return {
        ...state,
        metadataFields: action.payload,
      };
    case getType(actions.deleteDataEntityMetadataAction.success):
      return {
        ...state,
        dataEntityMetadata: {
          ...state.dataEntityMetadata,
          [action.payload.dataEntityId]: {
            ...state.dataEntityMetadata[action.payload.dataEntityId],
            allIds: filter(
              state.dataEntityMetadata[action.payload.dataEntityId].allIds,
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
