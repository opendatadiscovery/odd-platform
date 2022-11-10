import {
  Configuration,
  DataEntityRunApi,
  type DataEntityRunApiGetRunsRequest,
  type DataEntityRun,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityRunApi = new DataEntityRunApi(apiClientConf);

export const fetchDataEntityRuns = handleResponseAsyncThunk<
  { items: DataEntityRun[]; pageInfo: CurrentPageInfo },
  DataEntityRunApiGetRunsRequest
>(
  actions.fetchDataEntityRunsActionType,
  async ({ dataEntityId, page, size, status }) => {
    const { items, pageInfo } = await dataEntityRunApi.getRuns({
      dataEntityId,
      page,
      size,
      status,
    });
    return { items, pageInfo: { ...pageInfo, page } };
  },
  {}
);
