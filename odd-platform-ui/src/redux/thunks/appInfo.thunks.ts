import { Configuration, AppInfoApi, AppInfo } from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new AppInfoApi(apiClientConf);

export const fetchAppInfo = createThunk<
  void,
  AppInfo | void,
  AppInfo | void
>(
  () => apiClient.getAppInfo(),
  actions.fetchAppInfo,
  (response: AppInfo | void) => response
);
