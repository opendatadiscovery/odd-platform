import type {
  DataSource,
  DataSourceApiDeleteDataSourceRequest,
  DataSourceApiGetDataSourceListRequest,
  DataSourceApiRegenerateDataSourceTokenRequest,
  DataSourceApiRegisterDataSourceRequest,
  DataSourceApiUpdateDataSourceRequest,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { dataSourceApi } from 'lib/api';

export const fetchDataSourcesList = handleResponseAsyncThunk<
  { datasourceList: Array<DataSource>; pageInfo: CurrentPageInfo },
  DataSourceApiGetDataSourceListRequest
>(
  actions.fetchDatasorcesActionType,
  async ({ page, size, query }) => {
    const { items, pageInfo } = await dataSourceApi.getDataSourceList({
      page,
      size,
      query,
    });

    return { datasourceList: items, pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const registerDataSource = handleResponseAsyncThunk<
  DataSource,
  DataSourceApiRegisterDataSourceRequest
>(
  actions.registerDataSourceActionType,
  async ({ dataSourceFormData }) =>
    await dataSourceApi.registerDataSource({ dataSourceFormData }),
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
    await dataSourceApi.updateDataSource({ dataSourceId, dataSourceUpdateFormData }),
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
  async ({ dataSourceId }) =>
    await dataSourceApi.regenerateDataSourceToken({ dataSourceId }),
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
    await dataSourceApi.deleteDataSource({ dataSourceId });

    return dataSourceId;
  },
  {
    setSuccessOptions: ({ dataSourceId }) => ({
      id: `Datasource-deleting-${dataSourceId}`,
      message: `Datasource successfully deleted.`,
    }),
  }
);
