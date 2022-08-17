import {
  createAction,
  isRejectedWithValue,
  Middleware,
} from '@reduxjs/toolkit';

export const RESET_STATE_ACTION_TYPE = 'resetState';
export const resetStateAction = createAction(
  RESET_STATE_ACTION_TYPE,
  () => ({
    payload: null,
  })
);

export const unauthenticatedMiddleware: Middleware =
  ({ dispatch }) =>
  next =>
  action => {
    if (isRejectedWithValue(action) && action.payload.status === 401) {
      // dispatch(resetStateAction());
      window.location.href = '/';
    }

    return next(action);
  };
