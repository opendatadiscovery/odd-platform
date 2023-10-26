import { createSelector } from '@reduxjs/toolkit';
import compact from 'lodash/compact';
import {
  getMyDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getMyUpstreamDataEntitiesFetchingStatuses,
  getPopularDataEntitiesFetchingStatuses,
} from 'redux/selectors/dataentity.selectors';

export const getIsOwnerEntitiesFetching = createSelector(
  getMyDataEntitiesFetchingStatuses,
  getMyUpstreamDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getPopularDataEntitiesFetchingStatuses,
  (...isFetchingFlags) =>
    compact(isFetchingFlags.map(({ isLoading }) => isLoading)).length > 0
);
