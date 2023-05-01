import { createSlice } from '@reduxjs/toolkit';
import { fetchDataEntityGroupLinkedList } from 'redux/thunks';
import type { DataEntityGroupLinkedListState } from 'redux/interfaces';
import { dataEntityGroupLinkedListActionTypePrefix } from 'redux/actions';

export const initialState: DataEntityGroupLinkedListState = {
  linkedItemsIdsByDataEntityGroupId: {},
  pageInfo: { total: 0, page: 0, hasNext: true },
};

export const dataEntityGroupLinkedListSlice = createSlice({
  name: dataEntityGroupLinkedListActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      fetchDataEntityGroupLinkedList.fulfilled,
      (state, { payload }): DataEntityGroupLinkedListState => {
        const { dataEntityGroupId, linkedItemsList, pageInfo } = payload;

        const linkedItemsIdsByDataEntityGroupId = {
          ...state.linkedItemsIdsByDataEntityGroupId,
          linkedItemsIdsByDataEntityGroupId: linkedItemsList.reduce<{
            [dataEntityGroupId: string]: number[];
          }>(
            (memo, linkedItem) => ({
              ...memo,
              [dataEntityGroupId]: [...(memo?.[dataEntityGroupId] || []), linkedItem.id],
            }),
            { ...state.linkedItemsIdsByDataEntityGroupId }
          ),
        };

        return { ...linkedItemsIdsByDataEntityGroupId, pageInfo };
      }
    );
  },
});

export default dataEntityGroupLinkedListSlice.reducer;
