import type {
  Tag,
  TermApiCreateTermRequest,
  TermApiCreateTermTagsRelationsRequest,
  TermApiDeleteTermRequest,
  TermApiGetTermDetailsRequest,
  TermApiGetTermsListRequest,
  TermApiUpdateTermRequest,
  TermDetails,
  TermRef,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { termApi } from 'lib/api';

export const createTerm = handleResponseAsyncThunk<TermDetails, TermApiCreateTermRequest>(
  actions.createTermActType,
  async ({ termFormData }) => await termApi.createTerm({ termFormData }),
  {
    setSuccessOptions: ({ termFormData }) => ({
      id: `Term-creating-${termFormData.name}`,
      message: `Term ${termFormData.name} successfully created.`,
    }),
  }
);

export const updateTerm = handleResponseAsyncThunk<TermDetails, TermApiUpdateTermRequest>(
  actions.updateTermActType,
  async ({ termId, termFormData }) => await termApi.updateTerm({ termId, termFormData }),
  {
    setSuccessOptions: ({ termFormData }) => ({
      id: `Term-updating-${termFormData.name}`,
      message: `Term ${termFormData.name} successfully updated.`,
    }),
  }
);

export const deleteTerm = handleResponseAsyncThunk<
  { termId: number },
  TermApiDeleteTermRequest
>(
  actions.deleteTermActType,
  async ({ termId }) => {
    await termApi.deleteTerm({ termId });

    return { termId };
  },
  {
    setSuccessOptions: ({ termId }) => ({
      id: `Term-deleting-${termId}`,
      message: `Term successfully deleted.`,
    }),
  }
);

export const fetchTermsList = handleResponseAsyncThunk<
  { termList: Array<TermRef>; pageInfo: CurrentPageInfo },
  TermApiGetTermsListRequest
>(
  actions.fetchTermListActType,
  async ({ page, size, query }) => {
    const { items: termList, pageInfo } = await termApi.getTermsList({
      page,
      size,
      query,
    });

    return {
      termList,
      pageInfo: { ...pageInfo, page, hasNext: size * page < pageInfo.total },
    };
  },
  {}
);

export const fetchTermDetails = handleResponseAsyncThunk<
  TermDetails,
  TermApiGetTermDetailsRequest
>(
  actions.fetchTermDetailsActType,
  async ({ termId }) => termApi.getTermDetails({ termId }),
  { switchOffErrorMessage: true }
);

export const updateTermDetailsTags = handleResponseAsyncThunk<
  { termId: number; tags: Array<Tag> },
  TermApiCreateTermTagsRelationsRequest
>(
  actions.updateTermDetailsTagsActType,
  async ({ termId, tagsFormData }) => {
    const tags = await termApi.createTermTagsRelations({
      termId,
      tagsFormData,
    });

    return { termId, tags };
  },
  {
    setSuccessOptions: ({ tagsFormData }) => ({
      id: `Term-tags-updating-${tagsFormData.tagNameList.length}`,
      message: `Term tags successfully updated.`,
    }),
  }
);
