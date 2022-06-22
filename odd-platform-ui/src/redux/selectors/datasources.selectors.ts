import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import { DataSourcesState } from 'redux/interfaces/state';
import { datasourceAdapter } from 'redux/reducers/datasources.slice';
import * as actions from 'redux/actions';

const dataSourcesState = ({ dataSources }: RootState): DataSourcesState =>
  dataSources;

export const { selectAll: getDataSourcesList } =
  datasourceAdapter.getSelectors<RootState>(state => state.dataSources);

export const getIsDataSourcesListFetching = createStatusesSelector(
  actions.fetchDatasorcesActionType
);

export const getIsDatasourceCreatingStatuses = createStatusesSelector(
  actions.registerDataSourceActionType
);

export const getDatasourceDeletingStatuses = createStatusesSelector(
  actions.deleteDatasourceActionType
);

export const getDataSourcesListPage = createSelector(
  dataSourcesState,
  dataSources => dataSources.pageInfo
);
