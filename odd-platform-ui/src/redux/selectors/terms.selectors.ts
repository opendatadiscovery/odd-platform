import { createSelector } from 'reselect';
import {
  createErrorSelector,
  createFetchingSelector,
} from 'redux/selectors/loader-selectors';
import { RootState, TermsState } from 'redux/interfaces';

const getTermCreationStatus = createFetchingSelector('POST_TERM');
const getTermUpdateStatus = createFetchingSelector('PUT_TERM');

const termsState = ({ terms }: RootState): TermsState => terms;

export const getTermId = (_: RootState, termId: number | string) => termId;

export const getTermDetails = createSelector(
  termsState,
  getTermId,
  (terms, termId) => terms.byId[termId]
);

export const getTermDetailsFetchingStatus =
  createFetchingSelector('GET_TERM_DETAILS');

export const getTermDetailsFetchingError =
  createErrorSelector('GET_TERM_DETAILS');

export const getTermDetailsFetching = createSelector(
  getTermDetailsFetchingStatus,
  status => status === 'fetching'
);

// Tags

export const getTermDetailsTags = createSelector(
  termsState,
  getTermId,
  (termDetails, termId) => termDetails.byId[termId]?.tags || []
);

const getTermDetailsTagsUpdateStatus = createFetchingSelector(
  'PUT_TERM_DETAILS_TAGS'
);

export const getTermDetailsTagsUpdating = createSelector(
  getTermDetailsTagsUpdateStatus,
  status => status === 'fetching'
);

// Ownership

const getTermDetailsOwnerUpdateStatus = createFetchingSelector(
  'PUT_TERM_DETAILS_OWNER'
);

export const getTermDetailsOwnerUpdating = createSelector(
  getTermDetailsOwnerUpdateStatus,
  status => status === 'fetching'
);

export const getIsTermCreating = createSelector(
  getTermCreationStatus,
  status => status === 'fetching'
);

export const getIsTermUpdating = createSelector(
  getTermUpdateStatus,
  status => status === 'fetching'
);

const getTermDeletionStatus = createFetchingSelector('DELETE_TERM');

export const getIsTermDeleting = createSelector(
  getTermDeletionStatus,
  status => status === 'fetching'
);

export const getIsTermDeleted = createSelector(
  getTermDeletionStatus,
  status => status === 'fetched'
);
