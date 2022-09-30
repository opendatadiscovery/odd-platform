import {
  Configuration,
  DataEntityRunApi,
  DataEntityRunApiGetRunsRequest,
  DataEntityRun,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces';

import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityRunApi = new DataEntityRunApi(apiClientConf);

export const fetchDataEntityRuns = createAsyncThunk<
  { items: DataEntityRun[]; pageInfo: CurrentPageInfo },
  DataEntityRunApiGetRunsRequest
>(actions.fetchDataEntityRunsActionType, async ({ dataEntityId, page, size, status }) => {
  const { items, pageInfo } = await dataEntityRunApi.getRuns({
    dataEntityId,
    page,
    size,
    status,
  });
  return { items, pageInfo: { ...pageInfo, page } };
});
