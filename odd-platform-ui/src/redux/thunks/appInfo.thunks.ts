import {
  type AppInfo,
  AppInfoApi,
  Configuration,
  type Feature,
  FeatureApi,
  type Link,
  LinksApi,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const appInfoApi = new AppInfoApi(apiClientConf);
const featureApi = new FeatureApi(apiClientConf);
const linksApi = new LinksApi(apiClientConf);

export const fetchAppInfo = handleResponseAsyncThunk<AppInfo>(
  actions.fetchAppInfoActionType,
  async () => await appInfoApi.getAppInfo(),
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

export const fetchAppLinks = handleResponseAsyncThunk<Link[]>(
  actions.fetchAppLinksActionType,
  async () => {
    const { items } = await linksApi.getLinks();
    return items;
  },
  {}
);
