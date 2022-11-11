import { createSelector } from '@reduxjs/toolkit';
import compact from 'lodash/compact';
import { getTagListFetchingStatuses } from 'redux/selectors/tags.selectors';
import { getIdentityFetchingStatuses } from 'redux/selectors/profile.selectors';
import {
  getMyDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getMyUpstreamDataEntitiesFetchingStatuses,
  getPopularDataEntitiesFetchingStatuses,
} from 'redux/selectors/dataentity.selectors';

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
