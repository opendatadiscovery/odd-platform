import {
  Configuration,
  TermApi,
  DataEntityList,
  TermApiGetTermLinkedItemsRequest,
} from 'generated-sources';
import { TermGroupLinkedList } from 'redux/interfaces';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new TermApi(apiClientConf);

export const fetchTermGroupLinkedList = createThunk<
  TermApiGetTermLinkedItemsRequest,
  DataEntityList,
  TermGroupLinkedList<DataEntityList>
>(
  (params: TermApiGetTermLinkedItemsRequest) =>
    apiClient.getTermLinkedItems(params),
  actions.fetchTermLinkedListAction,
  (
    response: DataEntityList,
    request: TermApiGetTermLinkedItemsRequest
  ) => ({
    termId: request.termId,
    value: response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
      hasNext: !!(request.size * request.page < response.pageInfo.total),
    },
  })
);
