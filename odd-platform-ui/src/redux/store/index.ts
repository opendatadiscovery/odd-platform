import { configureStore } from '@reduxjs/toolkit';
import rootReducer from 'redux/slices';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
});
