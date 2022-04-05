import { createSelector } from 'reselect';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { CollectorsState } from 'redux/interfaces/state';

const collectorsState = ({ collectors }: RootState): CollectorsState =>
  collectors;

const getCollectorsListFetchingStatus = createFetchingSelector(
  'GET_COLLECTOR_LIST'
);

export const getIsCollectorsListFetching = createSelector(
  getCollectorsListFetchingStatus,
  status => status === 'fetching'
);

export const getCollectorsList = createSelector(
  collectorsState,
  collectors => collectors.allIds.map(id => collectors.byId[id])
);

const getCollectorCreationStatus =
  createFetchingSelector('POST_COLLECTOR');

export const getIsCollectorCreating = createSelector(
  getCollectorCreationStatus,
  status => status === 'fetching'
);

const getCollectorDeletionStatus =
  createFetchingSelector('DELETE_COLLECTOR');

export const getIsCollectorDeleting = createSelector(
  getCollectorDeletionStatus,
  status => status === 'fetching'
);

export const getCollectorsListPage = createSelector(
  collectorsState,
  collectors => collectors.pageInfo
);
