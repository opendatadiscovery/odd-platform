import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import type { CurrentPageInfo, RootState, SavedSearchState } from 'redux/interfaces';
import type { SavedSearch } from 'generated-sources';
import * as actions from 'redux/actions';

export const savedSearchState = ({ savedSearch }: RootState): SavedSearchState =>
  savedSearch;

export const getSavedSearchListFetchingStatuses = createStatusesSelector(
  actions.fetchSavedSearchListActType
);
export const getSavedSearchCreatingStatuses = createStatusesSelector(
  actions.createSavedSearchActType
);
export const getSavedSearchUpdatingStatuses = createStatusesSelector(
  actions.updateSavedSearchActType
);

export const getSavedSearchList = createSelector(
  savedSearchState,
  (state): SavedSearch[] => state.list
);

export const getSavedSearchListPage = createSelector(
  savedSearchState,
  (state): CurrentPageInfo => state.pageInfo
);
