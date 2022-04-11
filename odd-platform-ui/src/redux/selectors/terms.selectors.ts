import { createSelector } from 'reselect';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';

const getTermCreationStatus = createFetchingSelector('POST_TERM');

export const getIsTermCreating = createSelector(
  getTermCreationStatus,
  status => status === 'fetching'
);

const getTermDeletionStatus = createFetchingSelector('DELETE_TERM');

export const getIsTermDeleting = createSelector(
  getTermDeletionStatus,
  status => status === 'fetching'
);
