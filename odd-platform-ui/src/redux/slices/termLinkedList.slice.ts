import { createSlice } from '@reduxjs/toolkit';
import { fetchTermLinkedList } from 'redux/thunks';
import type { TermLinkedListState } from 'redux/interfaces';
import { termLinkedListActionTypePrefix } from 'redux/actions';

export const initialState: TermLinkedListState = {
  linkedItemsIdsByTermId: {},
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

export const termLinkedListSlice = createSlice({
  name: termLinkedListActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      fetchTermLinkedList.fulfilled,
      (state, { payload }): TermLinkedListState => {
        const { termId, linkedItemsList, pageInfo } = payload;
        return {
          ...state,
          linkedItemsIdsByTermId: linkedItemsList.reduce(
            (memo: TermLinkedListState['linkedItemsIdsByTermId'], linkedItem) => ({
              ...memo,
              [termId]: [...(memo?.[termId] || []), linkedItem.id],
            }),
            {}
          ),
          pageInfo,
        };
      }
    );
  },
});

export default termLinkedListSlice.reducer;
