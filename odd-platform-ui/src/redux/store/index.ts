import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from 'redux/reducers';
import { unauthenticatedMiddleware } from 'redux/lib/unauthenticatedMiddleware';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat([unauthenticatedMiddleware]),
});
