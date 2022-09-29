import {
  Configuration,
  DataSource,
  DataSourceApi,
  DataSourceApiDeleteDataSourceRequest,
  DataSourceApiGetDataSourceListRequest,
  DataSourceApiRegenerateDataSourceTokenRequest,
  DataSourceApiRegisterDataSourceRequest,
  DataSourceApiUpdateDataSourceRequest,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { CurrentPageInfo } from 'redux/interfaces/common';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new DataSourceApi(apiClientConf);

export const fetchDataSourcesList = createAsyncThunk<
  { datasourceList: Array<DataSource>; pageInfo: CurrentPageInfo },
  DataSourceApiGetDataSourceListRequest
>(actions.fetchDatasorcesActionType, async ({ page, size, query }) => {
  const { items, pageInfo } = await apiClient.getDataSourceList({
    page,
    size,
    query,
  });

  return { datasourceList: items, pageInfo: { ...pageInfo, page } };
});

export const updateDataSource = createAsyncThunk<
  DataSource,
  DataSourceApiUpdateDataSourceRequest
>(
  actions.updateDatasourceActionType,
  async ({ dataSourceId, dataSourceUpdateFormData }) =>
    apiClient.updateDataSource({
      dataSourceId,
      dataSourceUpdateFormData,
    })
);

export const regenerateDataSourceToken = createAsyncThunk<
  DataSource,
  DataSourceApiRegenerateDataSourceTokenRequest
>(actions.regenerateDataSourceTokenActionType, async ({ dataSourceId }) =>
  apiClient.regenerateDataSourceToken({
    dataSourceId,
  })
);

export const registerDataSource = createAsyncThunk<
  DataSource,
  DataSourceApiRegisterDataSourceRequest
>(actions.registerDataSourceActionType, async ({ dataSourceFormData }) =>
  apiClient.registerDataSource({
    dataSourceFormData,
  })
);

export const deleteDataSource = createAsyncThunk<
  number,
  DataSourceApiDeleteDataSourceRequest
>(actions.deleteDatasourceActionType, async ({ dataSourceId }) => {
  await apiClient.deleteDataSource({ dataSourceId });

  return dataSourceId;
});
