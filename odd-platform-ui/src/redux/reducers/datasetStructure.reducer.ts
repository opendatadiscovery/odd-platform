import {
  Action,
  DatasetStructureState,
  DataSetStructureTypesCount,
} from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { EnumValue } from 'generated-sources';
import uniqBy from 'lodash/uniqBy';

export const initialState: DatasetStructureState = {
  fieldById: {},
  allFieldIdsByVersion: {},
  statsByVersionId: {},
  latestVersionByDataset: {},
  fieldEnumsByFieldId: {},
};

const reducer = (
  state = initialState,
  action: Action
): DatasetStructureState => {
  switch (action.type) {
    case getType(actions.fetchDataSetStructureAction.success):
      return {
        fieldById: action.payload.value.datasetStructure.fieldList.reduce(
          (memo, datasetField) => ({
            ...memo,
            [datasetField.id]: datasetField,
          }),
          state.fieldById
        ),
        allFieldIdsByVersion: {
          ...state.allFieldIdsByVersion,
          [action.payload.value.datasetStructure.dataSetVersion
            .id]: action.payload.value.datasetStructure.fieldList.reduce<{
            [key: number]: number[];
          }>(
            (fieldsList, field) => ({
              ...fieldsList,
              [field.parentFieldId || 0]: [
                ...(fieldsList[field.parentFieldId || 0] || []),
                field.id,
              ],
            }),
            {}
          ),
        },
        statsByVersionId: {
          ...state.statsByVersionId,
          [action.payload.value.datasetStructure.dataSetVersion
            .id]: action.payload.value.datasetStructure.fieldList.reduce<DataSetStructureTypesCount>(
            (typeStats, field) => ({
              ...typeStats,
              [field.type.type]: (typeStats[field.type.type] || 0) + 1,
            }),
            {}
          ),
        },
        latestVersionByDataset: {
          ...state.latestVersionByDataset,
          ...(action.payload.value.latest
            ? {
                [action.payload.entityId]:
                  action.payload.value.datasetStructure.dataSetVersion.id,
              }
            : null),
        },
        fieldEnumsByFieldId: state.fieldEnumsByFieldId,
      };
    case getType(actions.updateDataSetFieldFormDataParamsAction.success):
      return {
        ...state,
        fieldById: {
          ...state.fieldById,
          [action.payload.datasetFieldId]: {
            ...state.fieldById[action.payload.datasetFieldId],
            internalDescription: action.payload.internalDescription,
            labels: action.payload.labels,
          },
        },
      };
    case getType(actions.fetchDataSetFieldEnumAction.success):
      return {
        ...state,
        fieldEnumsByFieldId:
          action.payload.value.items?.reduce(
            (
              memo: DatasetStructureState['fieldEnumsByFieldId'],
              enumItem: EnumValue
            ) => ({
              ...memo,
              [action.payload.entityId]: uniqBy(
                [...(memo[action.payload.entityId] || []), enumItem],
                'id'
              ),
            }),
            { ...state.fieldEnumsByFieldId }
          ) || [],
      };
    case getType(actions.createDataSetFieldEnumAction.success):
      return {
        ...state,
        fieldEnumsByFieldId: {
          ...state.fieldEnumsByFieldId,
          [action.payload.entityId]: action.payload.value.items || [],
        },
        fieldById: {
          ...state.fieldById,
          [action.payload.entityId]: {
            ...state.fieldById[action.payload.entityId],
            enumValueCount: action.payload.value.items?.length,
          },
        },
      };
    default:
      return state;
  }
};

export default reducer;
