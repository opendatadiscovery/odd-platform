import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { DataEntitiesState } from 'redux/interfaces';
import keyBy from 'lodash/keyBy';
import { DataEntityDetails } from 'generated-sources';
import omit from 'lodash/omit';
import { dataEntitiesActionPrefix } from 'redux/actions';

export const initialState: DataEntitiesState = {
  classesAndTypesDict: {
    entityTypes: {},
    entityClasses: {},
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

export const dataEntitiesSlice = createSlice({
  name: dataEntitiesActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchDataEntitiesClassesAndTypes.pending,
      () => initialState
    );
    builder.addCase(
      thunks.fetchDataEntitiesClassesAndTypes.fulfilled,
      (state, { payload }) => ({
        ...state,
        classesAndTypesDict: {
          entityTypes: keyBy(payload.types, 'id'),
          entityClasses: keyBy(payload.entityClasses, 'id'),
        },
      })
    );

    builder.addCase(
      thunks.fetchDataEntityDetails.fulfilled,
      (state, { payload }) => updateDataEntity(state, payload)
    );

    builder.addCase(
      thunks.updateDataEntityTags.fulfilled,
      (state, { payload }) => {
        const { dataEntityId, tags } = payload;

        return {
          ...state,
          byId: {
            ...state.byId,
            [dataEntityId]: {
              ...state.byId[dataEntityId],
              tags,
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.updateDataEntityInternalDescription.fulfilled,
      (state, { payload }) => {
        const { dataEntityId, internalDescription } = payload;

        return {
          ...state,
          byId: {
            ...state.byId,
            [dataEntityId]: {
              ...state.byId[dataEntityId],
              internalDescription,
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.updateDataEntityInternalName.fulfilled,
      (state, { payload }) => {
        const { dataEntityId, internalName } = payload;

        return {
          ...state,
          byId: {
            ...state.byId,
            [dataEntityId]: {
              ...state.byId[dataEntityId],
              internalName,
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.fetchMyDataEntitiesList.fulfilled,
      (state, { payload }) => ({
        ...state,
        my: payload,
      })
    );

    builder.addCase(
      thunks.fetchMyUpstreamDataEntitiesList.fulfilled,
      (state, { payload }) => ({
        ...state,
        myUpstream: payload,
      })
    );

    builder.addCase(
      thunks.fetchMyDownstreamDataEntitiesList.fulfilled,
      (state, { payload }) => ({
        ...state,
        myDownstream: payload,
      })
    );

    builder.addCase(
      thunks.fetchPopularDataEntitiesList.fulfilled,
      (state, { payload }) => ({
        ...state,
        popular: payload,
      })
    );

    builder.addCase(
      thunks.fetchDataEntityGroupLinkedList.fulfilled,
      (state, { payload }) => {
        const { linkedItemsList } = payload;
        return {
          ...state,
          byId: linkedItemsList.reduce(
            (memo: DataEntitiesState['byId'], linkedItem) => ({
              ...memo,
              [linkedItem.id]: {
                ...linkedItem,
              },
            }),
            state.byId
          ),
        };
      }
    );
  },
});

export default dataEntitiesSlice.reducer;
