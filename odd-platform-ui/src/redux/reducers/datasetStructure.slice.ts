import {
  DatasetStructureState,
  DataSetStructureTypesCount,
} from 'redux/interfaces';
import * as thunks from 'redux/thunks';
import { createSlice } from '@reduxjs/toolkit';
import { EnumValue } from 'generated-sources';
import { datasetStructureActionTypePrefix } from 'redux/actions';

import uniqBy from 'lodash/uniqBy';

export const initialState: DatasetStructureState = {
  fieldById: {},
  allFieldIdsByVersion: {},
  statsByVersionId: {},
  latestVersionByDataset: {},
  fieldEnumsByFieldId: {},
};

export const datasetStructureSlice = createSlice({
  name: datasetStructureActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchDataSetStructureLatest.fulfilled,
      (state, { payload }) => ({
        ...state,
        fieldById: payload.value.datasetStructure.fieldList.reduce(
          (memo, datasetField) => ({
            ...memo,
            [datasetField.id]: datasetField,
          }),
          state.fieldById
        ),
        allFieldIdsByVersion: {
          ...state.allFieldIdsByVersion,
          [payload.value.datasetStructure.dataSetVersion.id]:
            payload.value.datasetStructure.fieldList.reduce<{
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
          [payload.value.datasetStructure.dataSetVersion.id]:
            payload.value.datasetStructure.fieldList.reduce<DataSetStructureTypesCount>(
              (typeStats, field) => ({
                ...typeStats,
                [field.type.type]: (typeStats[field.type.type] || 0) + 1,
              }),
              {}
            ),
        },
        latestVersionByDataset: {
          ...state.latestVersionByDataset,
          ...(payload.value.latest
            ? {
                [payload.entityId]:
                  payload.value.datasetStructure.dataSetVersion.id,
              }
            : null),
        },
        fieldEnumsByFieldId: state.fieldEnumsByFieldId,
      })
    );
    builder.addCase(
      thunks.fetchDataSetStructure.fulfilled,
      (state, { payload }) => ({
        ...state,
        fieldById: payload.value.datasetStructure.fieldList.reduce(
          (memo, datasetField) => ({
            ...memo,
            [datasetField.id]: datasetField,
          }),
          state.fieldById
        ),
        allFieldIdsByVersion: {
          ...state.allFieldIdsByVersion,
          [payload.value.datasetStructure.dataSetVersion.id]:
            payload.value.datasetStructure.fieldList.reduce<{
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
          [payload.value.datasetStructure.dataSetVersion.id]:
            payload.value.datasetStructure.fieldList.reduce<DataSetStructureTypesCount>(
              (typeStats, field) => ({
                ...typeStats,
                [field.type.type]: (typeStats[field.type.type] || 0) + 1,
              }),
              {}
            ),
        },
        latestVersionByDataset: {
          ...state.latestVersionByDataset,
          ...(payload.value.latest
            ? {
                [payload.entityId]:
                  payload.value.datasetStructure.dataSetVersion.id,
              }
            : null),
        },
        fieldEnumsByFieldId: state.fieldEnumsByFieldId,
      })
    );
    builder.addCase(
      thunks.updateDataSetFieldFormData.fulfilled,
      (state, { payload }) => ({
        ...state,
        fieldById: {
          ...state.fieldById,
          [payload.datasetFieldId]: {
            ...state.fieldById[payload.datasetFieldId],
            internalDescription: payload.internalDescription,
            labels: payload.labels,
          },
        },
      })
    );
    builder.addCase(
      thunks.fetchDataSetFieldEnum.fulfilled,
      (state, { payload }) => ({
        ...state,
        fieldEnumsByFieldId:
          payload.value.items?.reduce(
            (
              memo: DatasetStructureState['fieldEnumsByFieldId'],
              enumItem: EnumValue
            ) => ({
              ...memo,
              [payload.entityId]: uniqBy(
                [...(memo[payload.entityId] || []), enumItem],
                'id'
              ),
            }),
            { ...state.fieldEnumsByFieldId }
          ) || [],
      })
    );
    builder.addCase(
      thunks.createDataSetFieldEnum.fulfilled,
      (state, { payload }) => ({
        ...state,
        fieldEnumsByFieldId: {
          ...state.fieldEnumsByFieldId,
          [payload.entityId]: payload.value.items || [],
        },
        fieldById: {
          ...state.fieldById,
          [payload.entityId]: {
            ...state.fieldById[payload.entityId],
            enumValueCount: payload.value.items?.length,
          },
        },
      })
    );
  },
});
export default datasetStructureSlice.reducer;
