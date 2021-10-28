import { createSelector } from 'reselect';
import compact from 'lodash/compact';
import {
  getMyDataEntitiesFetching,
  getMyDownstreamDataEntitiesFetching,
  getMyUpstreamDataEntitiesFetching,
  getPopularDataEntitiesFetching,
} from './dataentity.selectors';
import { getIsTagsListFetching } from './tags.selectors';
import { getIdentityFetching } from './profile.selectors';
import { getAlertTotalsFetching } from './alert.selectors';

export const getMainOverviewContentIsFetching = createSelector(
  getIsTagsListFetching,
  getAlertTotalsFetching,
  getIdentityFetching,
  getMyDataEntitiesFetching,
  getMyUpstreamDataEntitiesFetching,
  getMyDownstreamDataEntitiesFetching,
  getPopularDataEntitiesFetching,
  (...statuses: boolean[]) => compact(statuses).length > 0
);
