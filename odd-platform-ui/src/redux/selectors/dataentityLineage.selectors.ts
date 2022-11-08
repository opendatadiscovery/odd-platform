import { createSelector } from '@reduxjs/toolkit';
import type {
  AsyncRequestStatus,
  DataEntityLineageState,
  RootState,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

const getDataEntityId = (_: RootState, dataEntityId: number | string) => dataEntityId;

const dataEntitiesState = ({ dataEntityLineage }: RootState): DataEntityLineageState =>
  dataEntityLineage;

const getDataEntityUpstreamLineageFetchingStatus = createFetchingSelector(
  actions.fetchDataEntityUpstreamLineageActionType
);

const getDataEntityDownstreamLineageFetchingStatus = createFetchingSelector(
  actions.fetchDataEntityDownstreamLineageActionType
);

export const getDataEntityLineageStreamFetching = createSelector(
  getDataEntityUpstreamLineageFetchingStatus,
  getDataEntityDownstreamLineageFetchingStatus,
  (...statuses: AsyncRequestStatus[]) => statuses.includes('pending')
);

export const getDataEntityLineage = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntityLineage, dataEntityId) => dataEntityLineage[dataEntityId]
);
