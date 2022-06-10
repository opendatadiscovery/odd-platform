import { createSlice } from '@reduxjs/toolkit';
import { dataEntitiesSearchActionTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';
import { initialState } from 'redux/reducers/dataentitiesSearch.reducer';

export const dataEntitiesSearchSlice = createSlice({
  name: dataEntitiesSearchActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchSearchSuggestions.fulfilled,
      (state, { payload }) => {
        state.suggestions = payload;
      }
    );
  },
});

export default dataEntitiesSearchSlice.reducer;
