import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { LabelsState } from 'redux/interfaces';
import type { Label } from 'generated-sources';
import { labelsActionPrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';

export const labelsAdapter = createEntityAdapter<Label>({
  selectId: label => label.id,
});

export const initialState: LabelsState = {
  pageInfo: { total: 0, page: 0, hasNext: true },
  ...labelsAdapter.getInitialState(),
};

export const labelsSlice = createSlice({
  name: labelsActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchLabelsList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;

      state.pageInfo = pageInfo;

      if (pageInfo.page > 1) {
        labelsAdapter.setMany(state, items);
        return state;
      }
      labelsAdapter.setAll(state, items);
      return state;
    });
    builder.addCase(thunks.createLabel.fulfilled, (state, { payload }) => {
      labelsAdapter.addMany(state, payload);
    });
    builder.addCase(thunks.updateLabel.fulfilled, (state, { payload }) => {
      labelsAdapter.upsertOne(state, payload);
    });
    builder.addCase(thunks.deleteLabel.fulfilled, (state, { payload }) => {
      labelsAdapter.removeOne(state, payload);
    });
  },
});

export default labelsSlice.reducer;
