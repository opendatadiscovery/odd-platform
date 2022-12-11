import type { AsyncRequestStatus, ErrorState, RootState } from 'redux/interfaces';
import { createSelector } from '@reduxjs/toolkit';

export const createFetchingSelector = (action: string) => (state: RootState) =>
  state.loader.statuses[action] || 'initial';

export const createErrorSelector =
  (action: string) =>
  (state: RootState): ErrorState | undefined =>
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
