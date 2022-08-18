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
  async ({ dataSourceId, dataSourceUpdateFormData }) => {
    const datasource = await apiClient.updateDataSource({
      dataSourceId,
      dataSourceUpdateFormData,
    });

    return datasource;
  }
);

export const regenerateDataSourceToken = createAsyncThunk<
  DataSource,
  DataSourceApiRegenerateDataSourceTokenRequest
>(
  actions.regenerateDataSourceTokenActionType,
  async ({ dataSourceId }) => {
    const datasource = await apiClient.regenerateDataSourceToken({
      dataSourceId,
    });

    return datasource;
  }
);

export const registerDataSource = createAsyncThunk<
  DataSource,
  DataSourceApiRegisterDataSourceRequest
>(actions.registerDataSourceActionType, async ({ dataSourceFormData }) => {
  const datasource = await apiClient.registerDataSource({
    dataSourceFormData,
  });

  return datasource;
});

export const deleteDataSource = createAsyncThunk<
  number,
  DataSourceApiDeleteDataSourceRequest
>(actions.deleteDatasourceActionType, async ({ dataSourceId }) => {
  await apiClient.deleteDataSource({ dataSourceId });

  return dataSourceId;
});
