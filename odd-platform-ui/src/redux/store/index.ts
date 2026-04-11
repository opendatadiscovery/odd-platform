import { configureStore } from '@reduxjs/toolkit';
import type { SerializableStateInvariantMiddlewareOptions } from '@reduxjs/toolkit/src/serializableStateInvariantMiddleware';
import { unauthenticatedMiddleware } from 'redux/lib/unauthenticatedMiddleware';
import rootReducer from 'redux/slices';

const serializableCheck: SerializableStateInvariantMiddlewareOptions = {
  ignoredPaths: [
    /token/,
    /lastIngestedAt/,
    /sourceCreatedAt/,
    /sourceUpdatedAt/,
    /createdAt/,
    /updatedAt/,
    /startTime/,
    /endTime/,
  ],
  ignoredActionPaths: [
    /token/,
    /lastIngestedAt/,
    /sourceCreatedAt/,
    /sourceUpdatedAt/,
    /createdAt/,
    /updatedAt/,
    /startTime/,
    /endTime/,
  ],
};
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck }).concat(unauthenticatedMiddleware),
});
