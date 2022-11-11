import { createSelector } from '@reduxjs/toolkit';
import type { CurrentPageInfo, RootState, CollectorsState } from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import { collectorAdapter } from 'redux/slices/collectors.slice';
import * as actions from 'redux/actions';

const collectorsState = ({ collectors }: RootState): CollectorsState => collectors;

export const { selectAll: getCollectorsList } = collectorAdapter.getSelectors<RootState>(
  state => state.collectors
);

export const getCollectorsListFetchingStatuses = createStatusesSelector(
  actions.fetchCollectorsActionType
);

export const getCollectorCreatingStatuses = createStatusesSelector(
  actions.registerCollectorActionType
);

export const getCollectorDeletingStatuses = createStatusesSelector(
  actions.deleteCollectorActionType
);

export const getCollectorsUpdatingStatuses = createStatusesSelector(
  actions.updateCollectorActionType
);

export const getCollectorsListPage = createSelector(
  collectorsState,
  (collectors): CurrentPageInfo => collectors.pageInfo
);
