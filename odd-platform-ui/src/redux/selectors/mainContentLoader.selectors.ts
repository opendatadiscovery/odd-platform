import { createSelector } from '@reduxjs/toolkit';
import compact from 'lodash/compact';
import {
  getIdentityFetchingStatuses,
  getMyDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getMyUpstreamDataEntitiesFetchingStatuses,
  getPopularDataEntitiesFetchingStatuses,
  getTagsListFetchingStatuses,
} from 'redux/selectors';

export const getIsMainOverviewContentFetching = createSelector(
  getTagsListFetchingStatuses,
  getIdentityFetchingStatuses,
  getMyDataEntitiesFetchingStatuses,
  getMyUpstreamDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getPopularDataEntitiesFetchingStatuses,
  getIdentityFetchingStatuses,
  (...isFetchingFlags) =>
    compact(isFetchingFlags.map(({ isLoading }) => isLoading)).length > 0
);
