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
import { getSearchIsFetching } from './dataentitySearch.selectors';
import { getIsDatasourcesListFetching } from './datasources.selectors';
import { getIsTagsListFetching } from './tags.selectors';
import { getDataSetStructureFetching } from './datasetStructure.selectors';
import { getDataEntityLineageFetching } from './dataentityLineage.selectors';
import { getIdentityFetching } from './profile.selectors';

export const getMainContentLoading = createSelector(
  getDataEntitiesListFetching,
  getSearchIsFetching,
  getDataEntityDetailsFetching,
  getDataSetStructureFetching,
  getDataEntityLineageFetching,
  getIsDatasourcesListFetching,
  getIsTagsListFetching,
  getIdentityFetching,
  getMyDataEntitiesFetching,
  getMyUpstreamDataEntitiesFetching,
  getMyDownstreamDataEntitiesFetching,
  getPopularDataEntitiesFetching,
  (...statuses: boolean[]) => compact(statuses).length > 0
);
