import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createLegacyFetchingSelector } from 'redux/selectors/loader-selectors';
import { DataSourcesState } from 'redux/interfaces/state';

const dataSourcesState = ({ dataSources }: RootState): DataSourcesState =>
  dataSources;

const getDataSourcesListFetchingStatus = createLegacyFetchingSelector(
  'GET_DATASOURCE_LIST'
);

export const getIsDataSourcesListFetching = createSelector(
  getDataSourcesListFetchingStatus,
  status => status === 'fetching'
);

export const getDataSourcesList = createSelector(
  dataSourcesState,
  dataSources => dataSources.allIds.map(id => dataSources.byId[id])
);

const getDataSourceCreationStatus =
  createLegacyFetchingSelector('POST_DATASOURCE');

export const getIsDatasourceCreating = createSelector(
  getDataSourceCreationStatus,
  status => status === 'fetching'
);

const getDataSourceDeletionStatus = createLegacyFetchingSelector(
  'DELETE_DATASOURCE'
);

export const getIsDatasourceDeleting = createSelector(
  getDataSourceDeletionStatus,
  status => status === 'fetching'
);

export const getDataSourcesListPage = createSelector(
  dataSourcesState,
  dataSources => dataSources.pageInfo
);
