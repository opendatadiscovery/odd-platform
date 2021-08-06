import { createSelector } from 'reselect';
import { compact } from 'lodash';
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
import { getAlertListFetching } from './alert.selectors';

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
