import { createSlice } from '@reduxjs/toolkit';
import type { MetaDataState } from 'redux/interfaces';
import * as thunks from 'redux/thunks';
import uniq from 'lodash/uniq';
import filter from 'lodash/filter';
import { metadataActionTypePrefix } from 'redux/actions';

export const initialState: MetaDataState = {
  dataEntityMetadata: {},
  metadataFields: [],
};

export const metadataSlice = createSlice({
  name: metadataActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchDataEntityDetails.fulfilled, (state, { payload }) => {
      const { id: dataEntityId, metadataFieldValues } = payload;
      return {
        ...state,
        dataEntityMetadata: {
          ...state.dataEntityMetadata,
          [dataEntityId]: {
            byId: metadataFieldValues.reduce(
              (memo, metadata) => ({
                ...memo,
                [metadata.field.id]: metadata,
              }),
              {}
            ),
            allIds: metadataFieldValues.map(metadata => metadata.field.id),
          },
        },
      };
    });

    builder.addCase(
      thunks.createDataEntityCustomMetadata.fulfilled,
      (state, { payload }) => {
        const { dataEntityId, metadataList } = payload;

        return {
          ...state,
          dataEntityMetadata: {
            ...state.dataEntityMetadata,
            [dataEntityId]: {
              byId: metadataList.reduce(
                (memo, metadata) => ({
                  ...memo,
                  [metadata.field.id]: metadata,
                }),
                state.dataEntityMetadata[dataEntityId].byId
              ),
              allIds: uniq([
                ...metadataList.map(metadata => metadata.field.id),
                ...state.dataEntityMetadata[dataEntityId].allIds,
              ]),
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.updateDataEntityCustomMetadata.fulfilled,
      (state, { payload }) => {
        const { dataEntityId, metadataFieldId, metadata } = payload;

        return {
          ...state,
          dataEntityMetadata: {
            ...state.dataEntityMetadata,
            [dataEntityId]: {
              ...state.dataEntityMetadata[dataEntityId],
              byId: {
                ...state.dataEntityMetadata[dataEntityId].byId,
                [metadataFieldId]: metadata,
              },
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.deleteDataEntityCustomMetadata.fulfilled,
      (state, { payload }) => {
        const { dataEntityId, metadataFieldId } = payload;

        return {
          ...state,
          dataEntityMetadata: {
            ...state.dataEntityMetadata,
            [dataEntityId]: {
              ...state.dataEntityMetadata[dataEntityId],
              allIds: filter(
                state.dataEntityMetadata[dataEntityId].allIds,
                id => id !== metadataFieldId
              ),
            },
          },
        };
      }
    );

    builder.addCase(thunks.searchMetadata.fulfilled, (state, { payload }) => {
      const { metadataFields } = payload;
      return { ...state, metadataFields };
    });
  },
});

export default metadataSlice.reducer;
