import {
  DataSetFieldEnumsResponse,
  DataSetStructureResponse,
  DatasetStructureState,
  DataSetStructureTypesCount,
} from 'redux/interfaces';
import * as thunks from 'redux/thunks';
import { createSlice } from '@reduxjs/toolkit';
import { datasetStructureActionTypePrefix } from 'redux/actions';
import compact from 'lodash/compact';

export const initialState: DatasetStructureState = {
  fieldById: {},
  allFieldIdsByVersion: {},
  statsByVersionId: {},
  latestVersionByDataset: {},
  fieldEnumsByFieldId: {},
};

export const updateDatasetStructure = (
  state: DatasetStructureState,
  { payload }: { payload: DataSetStructureResponse }
): DatasetStructureState => {
  const { dataEntityId, dataSetVersionId, fieldList, isLatestVersion } = payload;

  let isUniqueStatsExist = false;

  return {
    ...state,
    fieldById: fieldList.reduce(
      (memo, datasetField) => ({
        ...memo,
        [datasetField.id]: datasetField,
      }),
      state.fieldById
    ),
    allFieldIdsByVersion: {
      ...state.allFieldIdsByVersion,
      [dataSetVersionId]: fieldList.reduce<{
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
      [dataSetVersionId]: fieldList.reduce<{
        typeStats: DataSetStructureTypesCount;
        isUniqueStatsExist: boolean;
      }>(
        ({ typeStats }, field) => {
          const uniqStats = compact(Object.values(field.stats || {}));
          if (uniqStats.length > 0) isUniqueStatsExist = true;

          return {
            typeStats: {
              ...typeStats,
              [field.type.type]: (typeStats[field.type.type] || 0) + 1,
            },
            isUniqueStatsExist,
          };
        },
        { typeStats: {}, isUniqueStatsExist: false }
      ),
    },
    latestVersionByDataset: {
      ...state.latestVersionByDataset,
      ...(isLatestVersion ? { [dataEntityId]: dataSetVersionId } : null),
    },
  };
};

const updateDataSetFieldEnums = (
  state: DatasetStructureState,
  { payload }: { payload: DataSetFieldEnumsResponse }
): DatasetStructureState => {
  const { datasetFieldId, enumValueList } = payload;

  return {
    ...state,
    fieldEnumsByFieldId: {
      ...state.fieldEnumsByFieldId,
      [datasetFieldId]: enumValueList || [],
    },
    fieldById: {
      ...state.fieldById,
      [datasetFieldId]: {
        ...state.fieldById[datasetFieldId],
        enumValueCount: enumValueList?.length,
      },
    },
  };
};

export const datasetStructureSlice = createSlice({
  name: datasetStructureActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchDataSetStructureLatest.fulfilled, updateDatasetStructure);
    builder.addCase(thunks.fetchDataSetStructure.fulfilled, updateDatasetStructure);
    builder.addCase(thunks.fetchDataSetFieldEnum.fulfilled, updateDataSetFieldEnums);
    builder.addCase(thunks.createDataSetFieldEnum.fulfilled, updateDataSetFieldEnums);
    builder.addCase(
      thunks.updateDataSetFieldFormData.fulfilled,
      (state, { payload }): DatasetStructureState => {
        const { datasetFieldId, internalDescription, labels } = payload;

        return {
          ...state,
          fieldById: {
            ...state.fieldById,
            [datasetFieldId]: {
              ...state.fieldById[datasetFieldId],
              internalDescription,
              labels,
            },
          },
        };
      }
    );
  },
});
export default datasetStructureSlice.reducer;
