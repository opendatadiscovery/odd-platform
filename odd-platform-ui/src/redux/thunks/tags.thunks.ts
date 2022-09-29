import {
  Configuration,
  Tag,
  TagApi,
  TagApiCreateTagRequest,
  TagApiDeleteTagRequest,
  TagApiGetPopularTagListRequest,
  TagApiUpdateTagRequest,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces/common';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new TagApi(apiClientConf);

export const fetchTagsList = createAsyncThunk<
  { items: Array<Tag>; pageInfo: CurrentPageInfo },
  TagApiGetPopularTagListRequest
>(actions.fetchTagsActionType, async ({ page, size, query, ids }) => {
  const { items, pageInfo } = await apiClient.getPopularTagList({
    page,
    size,
    query,
    ids,
  });

  return { items, pageInfo: { ...pageInfo, page } };
});

export const createTag = createAsyncThunk<Tag[], TagApiCreateTagRequest>(
  actions.createTagsActionType,
  async params => apiClient.createTag(params)
);

export const updateTag = createAsyncThunk<Tag, TagApiUpdateTagRequest>(
  actions.updateTagActionType,
  async ({ tagId, tagFormData }) => apiClient.updateTag({ tagId, tagFormData })
);

export const deleteTag = createAsyncThunk<number, TagApiDeleteTagRequest>(
  actions.deleteTagActionType,
  async ({ tagId }) => {
    await apiClient.deleteTag({ tagId });

    return tagId;
  }
);
