import { type Middleware } from '@reduxjs/toolkit';

export const unauthenticatedMiddleware: Middleware = () => next => action => {
  if (action.payload?.status === 401) {
    window.location.reload();
  }

  return next(action);
};
