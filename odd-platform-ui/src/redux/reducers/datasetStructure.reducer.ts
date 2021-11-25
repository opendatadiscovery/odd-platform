import {
  Action,
  DatasetStructureState,
  DataSetStructureTypesCount,
} from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';

export const initialState: DatasetStructureState = {
  fieldById: {},
  allFieldIdsByVersion: {},
  statsByVersionId: {},
  latestVersionByDataset: {},
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
    default:
      return state;
  }
};

export default reducer;
