import {
  Configuration,
  AppInfoApi,
  type AppInfo,
  FeatureApi,
  type Feature,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const appInfoApi = new AppInfoApi(apiClientConf);
const featureApi = new FeatureApi(apiClientConf);

export const fetchAppInfo = handleResponseAsyncThunk<AppInfo>(
  actions.fetchAppInfoActionType,
  async () => {
    const response = await appInfoApi.getAppInfo();
    return response;
  },
  {}
);

export const fetchActiveFeatures = handleResponseAsyncThunk<Feature[]>(
  actions.fetchActiveFeaturesActionType,
  async () => {
    const { items } = await featureApi.getActiveFeatures();
    return items;
  },
  {}
);
