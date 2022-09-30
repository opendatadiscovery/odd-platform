import {
  Configuration,
  DataEntity,
  DataEntityApi,
  DataEntityApiGetDataEntityGroupsChildrenRequest,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchDataEntityGroupLinkedList = createAsyncThunk<
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
  }
);
