import type { DataEntityRun, DataEntityRunApiGetRunsRequest } from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { dataEntityRunApi } from 'lib/api';

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
