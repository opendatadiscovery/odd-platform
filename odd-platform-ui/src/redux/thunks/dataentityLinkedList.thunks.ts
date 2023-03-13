import type {
  DataEntity,
  DataEntityApiGetDataEntityGroupsChildrenRequest,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { dataEntityApi } from 'lib/api';

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
