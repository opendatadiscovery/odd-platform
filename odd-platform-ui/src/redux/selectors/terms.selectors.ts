import { createSelector } from '@reduxjs/toolkit';
import {
  createLegacyFetchingSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import { RootState, TermsState } from 'redux/interfaces';
import * as actions from 'redux/actions';

const getTermCreationStatus = createLegacyFetchingSelector('POST_TERM');
const getTermUpdateStatus = createLegacyFetchingSelector('PUT_TERM');

const termsState = ({ terms }: RootState): TermsState => terms;

export const getTermId = (_: RootState, termId: number | string) => termId;

export const getTermDetails = createSelector(
  termsState,
  getTermId,
  (terms, termId) => terms.byId[termId]
);

export const getTermDetailsFetchingStatuses = createStatusesSelector(
  actions.fetchTermDetailsAction
);

// Tags

export const getTermDetailsTags = createSelector(
  termsState,
  getTermId,
  (termDetails, termId) => termDetails.byId[termId]?.tags || []
);

const getTermDetailsTagsUpdateStatus = createLegacyFetchingSelector(
  'PUT_TERM_DETAILS_TAGS'
);

export const getTermDetailsTagsUpdating = createSelector(
  getTermDetailsTagsUpdateStatus,
  status => status === 'fetching'
);

// Ownership

const getTermDetailsOwnerUpdateStatus = createLegacyFetchingSelector(
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

const getTermDeletionStatus = createLegacyFetchingSelector('DELETE_TERM');

export const getIsTermDeleting = createSelector(
  getTermDeletionStatus,
  status => status === 'fetching'
);

export const getIsTermDeleted = createSelector(
  getTermDeletionStatus,
  status => status === 'fetched'
);
