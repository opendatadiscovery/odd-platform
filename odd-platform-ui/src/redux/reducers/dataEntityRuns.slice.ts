import { DataEntityRun } from 'generated-sources';
import { DataEntityRunState } from 'redux/interfaces';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { dataEntityRunTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';

export const dataEntityRunAdapter = createEntityAdapter<DataEntityRun>({
  selectId: dataEntityRun => dataEntityRun.id,
});

export const initialState: DataEntityRunState = {
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
  ...dataEntityRunAdapter.getInitialState(),
};

export const dataEntityRunsSlice = createSlice({
  name: dataEntityRunTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchDataEntityRuns.fulfilled,
      (state, { payload }) => {
        const { items, pageInfo } = payload;
        if (pageInfo.page > 1) {
          dataEntityRunAdapter.setMany(state, items);
        } else {
          dataEntityRunAdapter.setAll(state, items);
        }
        state.pageInfo = pageInfo;
      }
    );
  },
});
export default dataEntityRunsSlice.reducer;
