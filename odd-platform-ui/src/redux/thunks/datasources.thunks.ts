import {
  Configuration,
  type DataSource,
  DataSourceApi,
  type DataSourceApiDeleteDataSourceRequest,
  type DataSourceApiGetDataSourceListRequest,
  type DataSourceApiRegenerateDataSourceTokenRequest,
  type DataSourceApiRegisterDataSourceRequest,
  type DataSourceApiUpdateDataSourceRequest,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

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

export const registerDataSource = handleResponseAsyncThunk<
  DataSource,
  DataSourceApiRegisterDataSourceRequest
>(
  actions.registerDataSourceActionType,
  async ({ dataSourceFormData }) =>
    await apiClient.registerDataSource({ dataSourceFormData }),
  {
    setSuccessOptions: ({ dataSourceFormData }) => ({
      id: `Datasource-creating-${dataSourceFormData.name}`,
      message: `Datasource ${dataSourceFormData.name} successfully created.`,
    }),
  }
);

export const updateDataSource = handleResponseAsyncThunk<
  DataSource,
  DataSourceApiUpdateDataSourceRequest
>(
  actions.updateDatasourceActionType,
  async ({ dataSourceId, dataSourceUpdateFormData }) =>
    await apiClient.updateDataSource({ dataSourceId, dataSourceUpdateFormData }),
  {
    setSuccessOptions: ({ dataSourceUpdateFormData }) => ({
      id: `Datasource-updating-${dataSourceUpdateFormData.name}`,
      message: `Datasource ${dataSourceUpdateFormData.name} successfully updated.`,
    }),
  }
);

export const regenerateDataSourceToken = handleResponseAsyncThunk<
  DataSource,
  DataSourceApiRegenerateDataSourceTokenRequest
>(
  actions.regenerateDataSourceTokenActionType,
  async ({ dataSourceId }) => await apiClient.regenerateDataSourceToken({ dataSourceId }),
  {
    setSuccessOptions: ({ dataSourceId }) => ({
      id: `Datasource-token-updating-${dataSourceId}`,
      message: `Datasource's token successfully regenerated.`,
    }),
  }
);

export const deleteDataSource = handleResponseAsyncThunk<
  number,
  DataSourceApiDeleteDataSourceRequest
>(
  actions.deleteDatasourceActionType,
  async ({ dataSourceId }) => {
    await apiClient.deleteDataSource({ dataSourceId });

    return dataSourceId;
  },
  {
    setSuccessOptions: ({ dataSourceId }) => ({
      id: `Datasource-deleting-${dataSourceId}`,
      message: `Datasource successfully deleted.`,
    }),
  }
);
