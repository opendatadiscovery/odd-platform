import type {
  DataSetFieldEnumsResponse,
  DataSetStructureResponse,
  DatasetStructureState,
  DataSetStructureTypesCount,
} from 'redux/interfaces';
import * as thunks from 'redux/thunks';
import { createSlice } from '@reduxjs/toolkit';
import { datasetStructureActionTypePrefix } from 'redux/actions';
import type { TermRef } from 'generated-sources';

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
      }>(
        ({ typeStats }, field) => ({
          typeStats: {
            ...typeStats,
            [field.type.type]: (typeStats[field.type.type] || 0) + 1,
          },
        }),
        { typeStats: {} }
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
        enumValueCount: enumValueList.items?.length,
      },
    },
  };
};

export const datasetStructureSlice = createSlice({
  name: datasetStructureActionTypePrefix,
  initialState,
  reducers: {
    addDatasetFieldTerm: (
      state,
      { payload }: { payload: { fieldId: number; term: TermRef } }
    ) => {
      const { fieldId, term } = payload;

      state.fieldById[fieldId].terms = [...(state.fieldById[fieldId].terms || []), term];
    },

    deleteDatasetFieldTerm: (
      state,
      { payload }: { payload: { fieldId: number; termId: TermRef['id'] } }
    ) => {
      const { fieldId, termId } = payload;

      state.fieldById[fieldId].terms = state.fieldById[fieldId].terms?.filter(
        term => term.id !== termId
      );
    },
  },
  extraReducers: builder => {
    builder.addCase(thunks.fetchDataSetStructureLatest.fulfilled, updateDatasetStructure);
    builder.addCase(thunks.fetchDataSetStructure.fulfilled, updateDatasetStructure);
    builder.addCase(thunks.fetchDataSetFieldEnum.fulfilled, updateDataSetFieldEnums);
    builder.addCase(thunks.createDataSetFieldEnum.fulfilled, updateDataSetFieldEnums);
    builder.addCase(
      thunks.updateDataSetFieldDescription.fulfilled,
      (state, { payload }): DatasetStructureState => {
        const { entityId: datasetFieldId, description: internalDescription } = payload;

        return {
          ...state,
          fieldById: {
            ...state.fieldById,
            [datasetFieldId]: { ...state.fieldById[datasetFieldId], internalDescription },
          },
        };
      }
    );
    builder.addCase(
      thunks.updateDataSetFieldLabels.fulfilled,
      (state, { payload }): DatasetStructureState => {
        const { entityId: datasetFieldId, labels } = payload;

        return {
          ...state,
          fieldById: {
            ...state.fieldById,
            [datasetFieldId]: { ...state.fieldById[datasetFieldId], labels },
          },
        };
      }
    );
  },
});

export const { addDatasetFieldTerm, deleteDatasetFieldTerm } =
  datasetStructureSlice.actions;
export default datasetStructureSlice.reducer;
