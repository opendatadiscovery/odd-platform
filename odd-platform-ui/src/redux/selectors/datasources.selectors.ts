import { createSelector } from 'reselect';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { DataSourcesState } from 'redux/interfaces/state';

const dataSourcesState = ({ dataSources }: RootState): DataSourcesState =>
  dataSources;

const getDataSourcesListFetchingStatus = createFetchingSelector(
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
  createFetchingSelector('POST_DATASOURCE');

export const getIsDatasourceCreating = createSelector(
  getDataSourceCreationStatus,
  status => status === 'fetching'
);

const getDataSourceDeletionStatus = createFetchingSelector(
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
