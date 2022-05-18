import { configureStore } from '@reduxjs/toolkit';
import rootReducer from 'redux/reducers';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
});
