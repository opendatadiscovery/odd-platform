import { createAsyncAction } from 'typesafe-actions';
import { DataSource, DataSourceList } from 'generated-sources';
import { DeleteDataSource } from 'redux/interfaces/datasources';
import { PaginatedResponse } from '../interfaces/common';

export const fetchDataSourcesAction = createAsyncAction(
  'GET_DATASOURCE_LIST__REQUEST',
  'GET_DATASOURCE_LIST__SUCCESS',
  'GET_DATASOURCE_LIST__FAILURE'
)<undefined, PaginatedResponse<DataSourceList>, undefined>();

export const updateDataSourceAction = createAsyncAction(
  'PUT_DATASOURCE__REQUEST',
  'PUT_DATASOURCE__SUCCESS',
  'PUT_DATASOURCE__FAILURE'
)<undefined, DataSource, undefined>();

export const registerDataSourceAction = createAsyncAction(
  'POST_DATASOURCE__REQUEST',
  'POST_DATASOURCE__SUCCESS',
  'POST_DATASOURCE__FAILURE'
)<undefined, DataSource, undefined>();

export const deleteDataSourceAction = createAsyncAction(
  'DELETE_DATASOURCE__REQUEST',
  'DELETE_DATASOURCE__SUCCESS',
  'DELETE_DATASOURCE__FAILURE'
)<undefined, DeleteDataSource, undefined>();
