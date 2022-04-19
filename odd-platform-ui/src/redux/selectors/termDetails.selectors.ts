import { createSelector } from 'reselect';
import { TermDetailsState, RootState } from '../interfaces';
import {
  createErrorSelector,
  createFetchingSelector,
} from './loader-selectors';

const termDetailsState = ({ termDetails }: RootState): TermDetailsState =>
  termDetails;

export const getTermId = (_: RootState, termId: number | string) => termId;

export const getTermDetails = createSelector(
  termDetailsState,
  getTermId,
  (termDetails, termId) => termDetails.byId[termId]
);

export const getTermDetailsFetchingStatus =
  createFetchingSelector('GET_TERM_DETAILS');

export const getTermDetailsFetchingError =
  createErrorSelector('GET_TERM_DETAILS');

export const getTermDetailsFetching = createSelector(
  getTermDetailsFetchingStatus,
  status => status === 'fetching'
);

export const getTermDetailsTags = createSelector(
  termDetailsState,
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
