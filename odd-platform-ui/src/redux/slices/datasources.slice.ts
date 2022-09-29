import { datasourceActionTypePrefix } from 'redux/actions';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { DataSource } from 'generated-sources';
import { DataSourcesState } from 'redux/interfaces/state';

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

      datasourceAdapter.setMany(state, datasourceList);
      state.pageInfo = pageInfo;
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
