import { type AppInfo, AppInfoApi, Configuration } from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new AppInfoApi(apiClientConf);

export const fetchAppInfo = handleResponseAsyncThunk<AppInfo>(
  actions.fetchAppInfoActionType,
  async () => await apiClient.getAppInfo(),
  {}
);
