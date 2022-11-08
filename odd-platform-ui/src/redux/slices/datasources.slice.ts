import { datasourceActionTypePrefix } from 'redux/actions';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import type { DataSource } from 'generated-sources';
import type { DataSourcesState } from 'redux/interfaces';

export const datasourceAdapter = createEntityAdapter<DataSource>({
  selectId: datasource => datasource.id,
});
export const initialState: DataSourcesState = {
  pageInfo: { total: 0, page: 0, hasNext: true },
  ...datasourceAdapter.getInitialState(),
};

export const datasourceSlice = createSlice({
  name: datasourceActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchDataSourcesList.fulfilled, (state, { payload }) => {
      const { datasourceList, pageInfo } = payload;

      state.pageInfo = pageInfo;

      if (pageInfo.page > 1) {
        datasourceAdapter.setMany(state, datasourceList);
        return state;
      }
      datasourceAdapter.setAll(state, datasourceList);
      return state;
    });
    builder.addCase(thunks.registerDataSource.fulfilled, (state, { payload }) => {
      datasourceAdapter.addOne(state, payload);
    });
    builder.addCase(thunks.updateDataSource.fulfilled, (state, { payload }) => {
      datasourceAdapter.upsertOne(state, payload);
    });
    builder.addCase(thunks.deleteDataSource.fulfilled, (state, { payload }) => {
      datasourceAdapter.removeOne(state, payload);
    });
    builder.addCase(thunks.regenerateDataSourceToken.fulfilled, (state, { payload }) => {
      datasourceAdapter.upsertOne(state, payload);
    });
  },
});

export default datasourceSlice.reducer;
