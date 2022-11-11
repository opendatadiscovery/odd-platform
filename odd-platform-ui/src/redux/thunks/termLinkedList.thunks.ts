import {
  Configuration,
  type DataEntity,
  TermApi,
  type TermApiGetTermLinkedItemsRequest,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const termApi = new TermApi(apiClientConf);

export const fetchTermLinkedList = handleResponseAsyncThunk<
  { termId: number; linkedItemsList: Array<DataEntity>; pageInfo: CurrentPageInfo },
  TermApiGetTermLinkedItemsRequest
>(
  actions.fetchTermLinkedListAction,
  async (params: TermApiGetTermLinkedItemsRequest) => {
    const { items, pageInfo } = await termApi.getTermLinkedItems(params);

    return {
      termId: params.termId,
      linkedItemsList: items,
      pageInfo: {
        ...pageInfo,
        page: params.page,
        hasNext: params.size * params.page < pageInfo.total,
      },
    };
  },
  {}
);
