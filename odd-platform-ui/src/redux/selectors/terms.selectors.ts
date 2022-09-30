import { createSelector } from '@reduxjs/toolkit';
import { RootState, TermsState } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';

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
  actions.updateTermDetailsTagsActType
);

// Ownership

export const getTermDetailsOwnerUpdatingStatuses = createStatusesSelector(
  actions.updateTermOwnershipAction
);

// statuses selectors

export const getTermDetailsFetchingStatuses = createStatusesSelector(
  actions.fetchTermDetailsActType
);
export const getTermCreatingStatuses = createStatusesSelector(actions.createTermActType);

export const getTermUpdatingStatuses = createStatusesSelector(actions.updateTermActType);

export const getTermDeletingStatuses = createStatusesSelector(actions.deleteTermActType);
