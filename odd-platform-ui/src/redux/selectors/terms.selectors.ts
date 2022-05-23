import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors';
import { RootState, TermsState } from 'redux/interfaces';
import * as actions from 'redux/actions';

const termsState = ({ terms }: RootState): TermsState => terms;

export const getTermId = (_: RootState, termId: number | string) => termId;

export const getTermDetails = createSelector(
  termsState,
  getTermId,
  (terms, termId) => terms.byId[termId]
);

// Tags

export const getTermDetailsTags = createSelector(
  termsState,
  getTermId,
  (termDetails, termId) => termDetails.byId[termId]?.tags || []
);

export const getTermDetailsTagsUpdatingStatuses = createStatusesSelector(
  actions.updateTermDetailsTagsAction
);

// Ownership

export const getTermDetailsOwnerUpdatingStatuses = createStatusesSelector(
  actions.updateTermOwnershipAction
);

// statuses selectors

export const getTermDetailsFetchingStatuses = createStatusesSelector(
  actions.fetchTermDetailsAction
);

export const getTermCreatingStatuses = createStatusesSelector(
  actions.createTermAction
);

export const getTermUpdatingStatuses = createStatusesSelector(
  actions.updateTermAction
);

export const getTermDeletingStatuses = createStatusesSelector(
  actions.deleteTermAction
);
