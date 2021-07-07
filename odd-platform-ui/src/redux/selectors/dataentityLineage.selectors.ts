import { createSelector } from 'reselect';
import { RootState, DataEntityLineageState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { getDataEntityId } from './dataentity.selectors';

const dataEntitiesState = ({
  dataEntityLineage,
}: RootState): DataEntityLineageState => dataEntityLineage;

const getDataEntityLineageFetchingStatus = createFetchingSelector(
  'GET_DATA_ENTITY_LINEAGE'
);

export const getDataEntityLineageFetching = createSelector(
  getDataEntityLineageFetchingStatus,
  status => status === 'fetching'
);

export const getDataEntityLineage = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntityLineage, dataEntityId) => dataEntityLineage[dataEntityId]
);
