import { configureStore } from '@reduxjs/toolkit';
import { unauthenticatedMiddleware } from 'redux/lib/unauthenticatedMiddleware';
import rootReducer from 'redux/slices';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat([unauthenticatedMiddleware]),
});
