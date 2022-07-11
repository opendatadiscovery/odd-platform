import { TagsState } from 'redux/interfaces/state';
import { Tag } from 'generated-sources';
import { tagsActionTypePrefix } from 'redux/actions';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';

export const tagsAdapter = createEntityAdapter<Tag>({
  selectId: tag => tag.id,
});
export const initialState: TagsState = {
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
  ...tagsAdapter.getInitialState(),
};

export const tagsSlice = createSlice({
  name: tagsActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchTagsList.fulfilled,
      (state, { payload }) => {
        const { items, pageInfo } = payload;
        if (pageInfo.page > 1) {
          tagsAdapter.setMany(state, items);
        } else {
          tagsAdapter.setAll(state, items);
        }
        state.pageInfo = pageInfo;
      }
    );
    builder.addCase(thunks.createTag.fulfilled, (state, { payload }) => {
      tagsAdapter.addMany(state, payload);
    });
    builder.addCase(thunks.updateTag.fulfilled, (state, { payload }) => {
      tagsAdapter.upsertOne(state, payload);
    });
    builder.addCase(thunks.deleteTag.fulfilled, (state, { payload }) => {
      tagsAdapter.removeOne(state, payload);
    });
  },
});

export default tagsSlice.reducer;
