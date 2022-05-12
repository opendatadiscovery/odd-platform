import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { TermsState } from 'redux/interfaces';
import omit from 'lodash/omit';
import { termsActionPrefix } from 'redux/actions';

export const initialState: TermsState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

export const termsSlice = createSlice({
  name: termsActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchTermDetails.fulfilled,
      (state, { payload }): TermsState => {
        const termDetails = payload;

        return {
          ...state,
          byId: {
            ...state.byId,
            [termDetails.id]: {
              ...state.byId[termDetails.id],
              ...omit(termDetails, ['ownership']), // Ownership is being stored in OwnersState
            },
          },
        };
      }
    );
  },
});

export default termsSlice.reducer;
