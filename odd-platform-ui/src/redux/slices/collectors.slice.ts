import type { Collector } from 'generated-sources';
import { collectorsActionTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { CollectorsState } from 'redux/interfaces';

export const collectorAdapter = createEntityAdapter<Collector>({
  selectId: collector => collector.id,
});

export const initialState: CollectorsState = {
  pageInfo: { total: 0, page: 0, hasNext: true },
  ...collectorAdapter.getInitialState(),
};

export const collectorSlice = createSlice({
  name: collectorsActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchCollectorsList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;

      state.pageInfo = pageInfo;

      if (pageInfo.page > 1) {
        collectorAdapter.setMany(state, items);
        return state;
      }
      collectorAdapter.setAll(state, items);

      return state;
    });
    builder.addCase(thunks.updateCollector.fulfilled, (state, { payload }) => {
      collectorAdapter.upsertOne(state, payload);
    });
    builder.addCase(thunks.deleteCollector.fulfilled, (state, { payload }) => {
      collectorAdapter.removeOne(state, payload);
    });
    builder.addCase(thunks.registerCollector.fulfilled, (state, { payload }) => {
      collectorAdapter.addOne(state, payload);
    });
    builder.addCase(thunks.regenerateCollectorToken.fulfilled, (state, { payload }) => {
      collectorAdapter.upsertOne(state, payload);
    });
  },
});

export default collectorSlice.reducer;
