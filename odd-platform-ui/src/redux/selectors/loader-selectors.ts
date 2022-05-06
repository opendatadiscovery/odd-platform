import { AsyncRequestStatus, RootState } from 'redux/interfaces';
import { createSelector } from '@reduxjs/toolkit';

export const createLegacyFetchingSelector =
  (action: string) => (state: RootState) =>
    state.legacyLoader.statuses[action] || 'notFetched';

export const createLegacyErrorSelector =
  (action: string) => (state: RootState) =>
    state.legacyLoader.errors[action];

export const createFetchingSelector =
  (action: string) => (state: RootState) =>
    state.loader.statuses[action] || 'initial';

export const createErrorSelector =
  (action: string) => (state: RootState) =>
    state.loader.errors[action];

export const createStatusesSelector = (action: string) => {
  const fetchingSelector = createFetchingSelector(action);

  const setStatuses = (status: AsyncRequestStatus) => ({
    isLoading: status === 'pending',
    isLoaded: status === 'fulfilled',
    isNotLoaded: status === 'rejected',
  });

  return createSelector(fetchingSelector, setStatuses);
};
