import {
  Configuration,
  type Tag,
  TagApi,
  type TagApiCreateTagRequest,
  type TagApiDeleteTagRequest,
  type TagApiGetPopularTagListRequest,
  type TagApiUpdateTagRequest,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new TagApi(apiClientConf);

export const fetchTagsList = handleResponseAsyncThunk<
  { items: Array<Tag>; pageInfo: CurrentPageInfo },
  TagApiGetPopularTagListRequest
>(
  actions.fetchTagsActType,
  async ({ page, size, query, ids }) => {
    const { items, pageInfo } = await apiClient.getPopularTagList({
      page,
      size,
      query,
      ids,
    });

    return { items, pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const createTag = handleResponseAsyncThunk<Tag[], TagApiCreateTagRequest>(
  actions.createTagsActType,
  async ({ tagFormData }) => await apiClient.createTag({ tagFormData }),
  {
    setSuccessOptions: ({ tagFormData }) => ({
      id: `Tags-creating-${tagFormData.length}`,
      message: `Tag${tagFormData.length > 1 ? 's' : ''} ${tagFormData.map(
        tag => ` ${tag.name}`
      )} successfully created.`,
    }),
  }
);

export const updateTag = handleResponseAsyncThunk<Tag, TagApiUpdateTagRequest>(
  actions.updateTagActType,
  async ({ tagId, tagFormData }) => await apiClient.updateTag({ tagId, tagFormData }),
  {
    setSuccessOptions: ({ tagFormData }) => ({
      id: `Tags-updating-${tagFormData.name}`,
      message: `Tag ${tagFormData.name} successfully updated.`,
    }),
  }
);

export const deleteTag = handleResponseAsyncThunk<number, TagApiDeleteTagRequest>(
  actions.deleteTagActType,
  async ({ tagId }) => {
    await apiClient.deleteTag({ tagId });

    return tagId;
  },
  {
    setSuccessOptions: ({ tagId }) => ({
      id: `Tags-deleting-${tagId}`,
      message: `Tag successfully deleted.`,
    }),
  }
);
