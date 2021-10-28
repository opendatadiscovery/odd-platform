import { createSelector } from 'reselect';
import compact from 'lodash/compact';
import {
  getDataEntitiesListFetching,
  getDataEntityDetailsFetching,
  getMyDataEntitiesFetching,
  getMyUpstreamDataEntitiesFetching,
  getMyDownstreamDataEntitiesFetching,
  getPopularDataEntitiesFetching,
} from './dataentity.selectors';
import { getIsDataSourcesListFetching } from './datasources.selectors';
import { getIsTagsListFetching } from './tags.selectors';
import { getDataSetStructureFetching } from './datasetStructure.selectors';
import { getDataEntityLineageFetching } from './dataentityLineage.selectors';
import { getIdentityFetching } from './profile.selectors';
import {
  getAlertListFetching,
  getAlertTotalsFetching,
} from './alert.selectors';

export const getMainContentLoading = createSelector(
  getDataEntitiesListFetching,
  getDataEntityDetailsFetching,
  getDataSetStructureFetching,
  getDataEntityLineageFetching,
  getIsDataSourcesListFetching,
  getIsTagsListFetching,
  getIdentityFetching,
  getMyDataEntitiesFetching,
  getMyUpstreamDataEntitiesFetching,
  getMyDownstreamDataEntitiesFetching,
  getPopularDataEntitiesFetching,
  getAlertListFetching,
  (...statuses: boolean[]) => compact(statuses).length > 0
);

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
