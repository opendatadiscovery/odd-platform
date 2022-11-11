import {
  Configuration,
  type DataEntity,
  DataEntityApi,
  type DataEntityApiGetDataEntityGroupsChildrenRequest,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchDataEntityGroupLinkedList = handleResponseAsyncThunk<
  {
    dataEntityGroupId: number;
    linkedItemsList: Array<DataEntity>;
    pageInfo: CurrentPageInfo;
  },
  DataEntityApiGetDataEntityGroupsChildrenRequest
>(
  actions.fetchDataEntityGroupLinkedListAction,
  async ({ dataEntityGroupId, page, size }) => {
    const { items, pageInfo } = await dataEntityApi.getDataEntityGroupsChildren({
      dataEntityGroupId,
      page,
      size,
    });

    return { dataEntityGroupId, linkedItemsList: items, pageInfo: { ...pageInfo, page } };
  },
  {}
);
