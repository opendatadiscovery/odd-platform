import { createSelector } from '@reduxjs/toolkit';
import compact from 'lodash/compact';
import {
  getMyDataEntitiesFetching,
  getMyDownstreamDataEntitiesFetching,
  getMyUpstreamDataEntitiesFetching,
  getPopularDataEntitiesFetching,
} from './dataentity.selectors';
import { getIsTagsListFetching } from './tags.selectors';
import { getIdentityFetching } from './profile.selectors';

export const getMainOverviewContentIsFetching = createSelector(
  getIsTagsListFetching,
  getIdentityFetching,
  getMyDataEntitiesFetching,
  getMyUpstreamDataEntitiesFetching,
  getMyDownstreamDataEntitiesFetching,
  getPopularDataEntitiesFetching,
  (...statuses: boolean[]) => compact(statuses).length > 0
);
