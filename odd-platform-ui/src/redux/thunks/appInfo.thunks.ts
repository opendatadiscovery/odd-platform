import type { AppInfo, Feature, Link } from 'generated-sources';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { appInfoApi, featureApi, linksApi } from 'lib/api';

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
