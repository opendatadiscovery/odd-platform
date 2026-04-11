import { createSelector } from '@reduxjs/toolkit';
import type { DataEntityRunState, RootState } from 'redux/interfaces';
import { dataEntityRunAdapter } from 'redux/slices/dataEntityRuns.slice';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

const getDataEntityRunState = ({ dataEntityRuns }: RootState): DataEntityRunState =>
  dataEntityRuns;

export const { selectAll: getDataEntityRunList } =
  dataEntityRunAdapter.getSelectors<RootState>(state => state.dataEntityRuns);

export const getDataEntityRunsFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityRunsActionType
);
export const getDataEntityRunsListPageInfo = createSelector(
  getDataEntityRunState,
  dataEntityRunsState => dataEntityRunsState.pageInfo
);
