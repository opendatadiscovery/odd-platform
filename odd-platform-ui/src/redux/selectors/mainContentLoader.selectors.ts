import { createSelector } from '@reduxjs/toolkit';
import compact from 'lodash/compact';
import {
  getIdentityFetchingStatuses,
  getMyDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getMyUpstreamDataEntitiesFetchingStatuses,
  getPopularDataEntitiesFetchingStatuses,
  getTagListFetchingStatuses,
} from 'redux/selectors';

export const getIsMainOverviewContentFetching = createSelector(
  getTagListFetchingStatuses,
  getIdentityFetchingStatuses,
  (...isFetchingFlags) =>
    compact(isFetchingFlags.map(({ isLoading }) => isLoading)).length > 0
);

export const getIsOwnerEntitiesFetching = createSelector(
  getMyDataEntitiesFetchingStatuses,
  getMyUpstreamDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getPopularDataEntitiesFetchingStatuses,
  (...isFetchingFlags) =>
    compact(isFetchingFlags.map(({ isLoading }) => isLoading)).length > 0
);
