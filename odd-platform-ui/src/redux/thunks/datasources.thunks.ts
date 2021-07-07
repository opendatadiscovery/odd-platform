import {
  DataSourceApi,
  Configuration,
  DataSourceList,
  DataSource,
  DataSourceApiGetDataSourceListRequest,
  DataSourceApiUpdateDataSourceRequest,
  DataSourceApiRegisterDataSourceRequest,
  DataSourceApiDeleteDataSourceRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import { DeleteDataSource } from 'redux/interfaces/datasources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PaginatedResponse } from 'redux/interfaces/common';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new DataSourceApi(apiClientConf);

export const fetchDataSourcesList = createThunk<
  DataSourceApiGetDataSourceListRequest,
  DataSourceList,
  PaginatedResponse<DataSourceList>
>(
  (params: DataSourceApiGetDataSourceListRequest) =>
    apiClient.getDataSourceList(params),
  actions.fetchDataSourcesAction,
  (
    response: DataSourceList,
    request: DataSourceApiGetDataSourceListRequest
  ) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
      hasNext: !!(request.size * request.page < response.pageInfo.total),
    },
  })
);

export const updateDataSource = createThunk<
  DataSourceApiUpdateDataSourceRequest,
  DataSource,
  DataSource
>(
  (params: DataSourceApiUpdateDataSourceRequest) =>
    apiClient.updateDataSource(params),
  actions.updateDataSourceAction,
  (result: DataSource) => result
);

export const registerDataSource = createThunk<
  DataSourceApiRegisterDataSourceRequest,
  DataSource,
  DataSource
>(
  (params: DataSourceApiRegisterDataSourceRequest) =>
    apiClient.registerDataSource(params),
  actions.registerDataSourceAction,
  (result: DataSource) => result
);

export const deleteDataSource = createThunk<
  DataSourceApiDeleteDataSourceRequest,
  void,
  DeleteDataSource
>(
  (params: DataSourceApiDeleteDataSourceRequest) =>
    apiClient.deleteDataSource(params),
  actions.deleteDataSourceAction,
  (_, request: DataSourceApiDeleteDataSourceRequest) => ({
    dataSourceId: request.dataSourceId,
  })
);
