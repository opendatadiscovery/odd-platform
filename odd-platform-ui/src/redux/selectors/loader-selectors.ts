import { RootState } from 'redux/interfaces';

export const createFetchingSelector =
  (action: string) => (state: RootState) =>
    state.loader.statuses[action] || 'notFetched';

export const createErrorSelector =
  (action: string) => (state: RootState) =>
    state.loader.errors[action];
