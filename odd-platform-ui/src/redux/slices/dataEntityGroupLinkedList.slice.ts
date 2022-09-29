import { createSlice } from '@reduxjs/toolkit';
import { fetchDataEntityGroupLinkedList } from 'redux/thunks';
import { DataEntityGroupLinkedListState } from 'redux/interfaces';
import { dataEntityGroupLinkedListActionTypePrefix } from 'redux/actions/dataentityLinkedList.actions';

export const initialState: DataEntityGroupLinkedListState = {
  linkedItemsIdsByDataEntityGroupId: {},
  pageInfo: { total: 0, page: 0, hasNext: true },
};

export const dataEntityGroupLinkedListSlice = createSlice({
  name: dataEntityGroupLinkedListActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchDataEntityGroupLinkedList.fulfilled, (state, { payload }) => {
      const { dataEntityGroupId, linkedItemsList, pageInfo } = payload;
      return {
        ...state,
        linkedItemsIdsByDataEntityGroupId: linkedItemsList.reduce(
          (
            memo: DataEntityGroupLinkedListState['linkedItemsIdsByDataEntityGroupId'],
            linkedItem
          ) => ({
            ...memo,
            [dataEntityGroupId]: [...(memo?.[dataEntityGroupId] || []), linkedItem.id],
          }),
          { ...state, pageInfo }
        ),
      };
    });
  },
});

export default dataEntityGroupLinkedListSlice.reducer;
