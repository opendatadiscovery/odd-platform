import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import type { TermsState } from 'redux/interfaces';
import omit from 'lodash/omit';
import { termsActTypePrefix } from 'redux/actions';

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
  name: termsActTypePrefix,
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

    builder.addCase(
      thunks.updateTermDetailsTags.fulfilled,
      (state, { payload }): TermsState => {
        const { termId, tags } = payload;

        return {
          ...state,
          byId: {
            ...state.byId,
            [termId]: {
              ...state.byId[termId],
              tags,
            },
          },
        };
      }
    );

    builder.addCase(thunks.createTerm.fulfilled, (state, { payload }): TermsState => {
      const term = payload;

      return {
        ...state,
        byId: { ...state.byId, [term.id]: term },
        allIds: [term.id, ...state.allIds],
      };
    });

    builder.addCase(thunks.updateTerm.fulfilled, (state, { payload }): TermsState => {
      const term = payload;

      return { ...state, byId: { ...state.byId, [term.id]: term } };
    });

    builder.addCase(thunks.deleteTerm.fulfilled, (state, { payload }): TermsState => {
      const { termId } = payload;

      return { ...state, allIds: state.allIds.filter(id => id !== termId) };
    });
  },
});

export default termsSlice.reducer;
