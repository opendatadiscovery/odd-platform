import {
  Configuration,
  DataEntityApi,
  DataEntityApiGetDataEntityGroupsChildrenRequest,
  DataEntityList,
} from 'generated-sources';
import { PartialEntityUpdateParamsPaginated } from 'redux/interfaces';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new DataEntityApi(apiClientConf);

export const fetchDataEntityGroupLinkedList = createThunk<
  DataEntityApiGetDataEntityGroupsChildrenRequest,
  DataEntityList,
  PartialEntityUpdateParamsPaginated<DataEntityList>
>(
  (params: DataEntityApiGetDataEntityGroupsChildrenRequest) =>
    apiClient.getDataEntityGroupsChildren(params),
  actions.fetchDataEntityGroupLinkedListAction,
  (
    response: DataEntityList,
    request: DataEntityApiGetDataEntityGroupsChildrenRequest
  ) => ({
    entityId: request.dataEntityGroupId,
    value: response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
      hasNext: !!(request.size * request.page < response.pageInfo.total),
    },
  })
);
