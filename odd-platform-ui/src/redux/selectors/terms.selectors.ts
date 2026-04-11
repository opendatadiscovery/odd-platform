import { createSelector } from '@reduxjs/toolkit';
import type { RootState, TermsState } from 'redux/interfaces';
import * as actions from 'redux/actions';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import { emptyArr, emptyObj } from 'lib/constants';

const termsState = ({ terms }: RootState): TermsState => terms;

export const getTermId = (_: RootState, termId: number | string) => termId;

export const getTermDetails = (termId: number) =>
  createSelector(termsState, terms => terms.byId[termId] || emptyObj);

export const getTermDetailsTags = createSelector(
  termsState,
  getTermId,
  (termDetails, termId) => termDetails.byId[termId]?.tags || emptyArr
);

export const getTermDetailsTagsUpdatingStatuses = createStatusesSelector(
  actions.updateTermDetailsTagsActType
);

export const getTermDetailsOwnerUpdatingStatuses = createStatusesSelector(
  actions.updateTermOwnershipAction
);

export const getTermDetailsOwnerCreatingStatuses = createStatusesSelector(
  actions.createTermOwnershipAction
);

export const getTermDetailsFetchingStatuses = createStatusesSelector(
  actions.fetchTermDetailsActType
);
export const getTermDetailsFetchingErrors = createErrorSelector(
  actions.fetchTermDetailsActType
);
export const getTermCreatingStatuses = createStatusesSelector(actions.createTermActType);

export const getTermUpdatingStatuses = createStatusesSelector(actions.updateTermActType);

export const getTermDeletingStatuses = createStatusesSelector(actions.deleteTermActType);
