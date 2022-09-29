import {
  Configuration,
  Tag,
  TermApi,
  TermApiCreateTermRequest,
  TermApiCreateTermTagsRelationsRequest,
  TermApiDeleteTermRequest,
  TermApiGetTermDetailsRequest,
  TermApiGetTermsListRequest,
  TermApiUpdateTermRequest,
  TermDetails,
  TermRef,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const termApi = new TermApi(apiClientConf);

export const createTerm = createAsyncThunk<TermDetails, TermApiCreateTermRequest>(
  actions.createTermAction,
  async ({ termFormData }) => termApi.createTerm({ termFormData })
);

export const updateTerm = createAsyncThunk<TermDetails, TermApiUpdateTermRequest>(
  actions.updateTermAction,
  async ({ termId, termFormData }) => termApi.updateTerm({ termId, termFormData })
);

export const deleteTerm = createAsyncThunk<{ termId: number }, TermApiDeleteTermRequest>(
  actions.deleteTermAction,
  async ({ termId }) => {
    await termApi.deleteTerm({ termId });

    return { termId };
  }
);

export const fetchTermsList = createAsyncThunk<
  { termList: Array<TermRef>; pageInfo: CurrentPageInfo },
  TermApiGetTermsListRequest
>(actions.fetchTermsListAction, async ({ page, size, query }) => {
  const { items: termList, pageInfo } = await termApi.getTermsList({
    page,
    size,
    query,
  });

  return {
    termList,
    pageInfo: { ...pageInfo, page, hasNext: size * page < pageInfo.total },
  };
});

export const fetchTermDetails = createAsyncThunk<
  TermDetails,
  TermApiGetTermDetailsRequest
>(actions.fetchTermDetailsAction, async ({ termId }) =>
  termApi.getTermDetails({ termId })
);

export const updateTermDetailsTags = createAsyncThunk<
  { termId: number; tags: Array<Tag> },
  TermApiCreateTermTagsRelationsRequest
>(actions.updateTermDetailsTagsAction, async ({ termId, tagsFormData }) => {
  const tags = await termApi.createTermTagsRelations({
    termId,
    tagsFormData,
  });

  return { termId, tags };
});
