import { createSelector } from 'reselect';
import {
  RootState,
  DataEntityLineageState,
  FetchStatus,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { getDataEntityId } from './dataentity.selectors';

const dataEntitiesState = ({
  dataEntityLineage,
}: RootState): DataEntityLineageState => dataEntityLineage;

const getDataEntityUpstreamLineageFetchingStatus = createFetchingSelector(
  'GET_DATA_ENTITY_UPSTREAM_LINEAGE'
);

const getDataEntityDownstreamLineageFetchingStatus = createFetchingSelector(
  'GET_DATA_ENTITY_DOWNSTREAM_LINEAGE'
);

export const getDataEntityLineageStreamFetching = createSelector(
  getDataEntityUpstreamLineageFetchingStatus,
  getDataEntityDownstreamLineageFetchingStatus,
  (...statuses: FetchStatus[]) => statuses.includes('fetching')
);

export const getDataEntityLineage = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntityLineage, dataEntityId) => dataEntityLineage[dataEntityId]
);
