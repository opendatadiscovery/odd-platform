import {
  Configuration,
  TagApi,
  TagsResponse,
  Tag,
  TagApiCreateTagRequest,
  TagApiUpdateTagRequest,
  TagApiDeleteTagRequest,
  TagApiGetPopularTagListRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PaginatedResponse } from 'redux/interfaces/common';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new TagApi(apiClientConf);

export const fetchTagsList = createThunk<
  TagApiGetPopularTagListRequest,
  TagsResponse,
  PaginatedResponse<TagsResponse>
>(
  (params: TagApiGetPopularTagListRequest) =>
    apiClient.getPopularTagList(params),
  actions.fetchTagsAction,
  (response: TagsResponse, request: TagApiGetPopularTagListRequest) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
      hasNext: !!(request.size * request.page < response.pageInfo.total),
    },
  })
);

export const createTag = createThunk<TagApiCreateTagRequest, Tag[], Tag[]>(
  (params: TagApiCreateTagRequest) => apiClient.createTag(params),
  actions.createTagsAction,
  (result: Tag[]) => result
);

export const updateTag = createThunk<TagApiUpdateTagRequest, Tag, Tag>(
  (params: TagApiUpdateTagRequest) => apiClient.updateTag(params),
  actions.updateTagAction,
  (result: Tag) => result
);

export const deleteTag = createThunk<TagApiDeleteTagRequest, void, number>(
  (params: TagApiDeleteTagRequest) => apiClient.deleteTag(params),
  actions.deleteTagAction,
  (_, reqParams) => reqParams.tagId
);
